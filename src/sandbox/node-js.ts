import * as fs from 'fs'
import * as path from 'path'
import * as vm from 'vm'
import { Writable } from 'stream'
import { inspect } from 'util'

import * as babel from '@babel/core'

const presetEnv = require('@babel/preset-env')
const presetTypescript = require('@babel/preset-typescript')

import { Output, SandboxOptions, Sandbox } from '.'
import { Reporter } from '../reporter'

const createProxies = (
  reporter: Reporter,
  handler: (output: Output) => void
) => {
  const createWritable = name => {
    return new Writable({
      write: value => {
        reporter[name].write(value)
        handler({ name, value })
      }
    })
  }
  const stdout = createWritable('stdout')
  const stderr = createWritable('stderr')

  const processProxy = new Proxy(process, {
    get: (target, name) => {
      switch (name) {
        case 'stdout':
          return stdout
        case 'stderr':
          return stderr
        default:
          return process[name].bind(process)
      }
    }
  })
  const consoleProxy = new Proxy(console, {
    get: (target, name) => {
      if (!(name in console)) {
        return undefined
      }
      return (...args) => {
        // FIXME time系とか
        reporter.stdout.write(
          `${args.map(arg => inspect(arg, { colors: true })).join(' ')}\n`
        )
        handler({
          name: `console.${name.toString()}`,
          value: args.map(arg => inspect(arg)).join(' ')
        })
      }
    }
  })

  return { processProxy, consoleProxy }
}

const createRequire = (rootPath: string, actualCodeObject) => {
  return (name: string) => {
    const validatePath = (p: string) => {
      if (p.startsWith(rootPath)) {
        return
      }
      if (p.startsWith(path.resolve(path.join(__dirname, '..')))) {
        return
      }

      throw new Error(`Sandbox Error: require ${name}`)
    }

    if (name.startsWith('./') || name.startsWith('../')) {
      const fullPath = require.resolve(name)
      validatePath(fullPath)
      return require(fullPath)
    }

    if (name.startsWith('/') || name.startsWith('.')) {
      throw new Error('Sandbox Error: Illegal path')
    }

    if (name === 'actual-code') {
      return actualCodeObject
    }
    const fullpath = path.resolve(path.join(rootPath, 'node_modules', name))
    if (fs.existsSync(fullpath)) {
      validatePath(fullpath)
      return require(fullpath)
    } else {
      validatePath(require.resolve(name))
      return require(name)
    }
  }
}

export class JsSandbox implements Sandbox {
  outputs: Output[] = []
  handlers: Array<(output: Output) => void> = []
  rootPath: string
  reporter: Reporter
  timeout: number
  ctx: any
  constructor(reporter: Reporter, opts: SandboxOptions = { settings: {} }) {
    this.reporter = reporter
    this.rootPath = path.resolve(opts.rootPath || process.cwd())
    this.timeout = opts.timeout || 100

    this.handleOutput(output => this.outputs.push(output))

    const { consoleProxy, processProxy } = createProxies(reporter, output => {
      this.handlers.forEach(handler => handler(output))
    })
    const actualCodeObject = {
      getData: () => opts.settings
    }
    const requireSandbox = createRequire(this.rootPath, actualCodeObject)
    this.ctx = {
      require: requireSandbox,
      setTimeout,
      setInterval,
      setImmediate,
      clearTimeout,
      clearInterval,
      clearImmediate,
      process: processProxy,
      Buffer,
      console: consoleProxy,
      exports: {}
    }
    vm.createContext(this.ctx)
  }

  handleOutput(handler: (output: Output) => void) {
    this.handlers.push(handler)
  }

  async run(code: string, filetype: string, meta) {
    this.outputs = []
    this.reporter.info(`run ${filetype}`)
    const compiled = await babel.transformAsync(code, {
      ast: false,
      presets: [[presetEnv, { targets: { node: '8.0.0' } }], presetTypescript],
      sourceType: 'module',
      filename: `file.${filetype}`
    })
    try {
      const timeout = meta.timeout || this.timeout
      vm.runInContext(compiled.code, this.ctx, { timeout })
    } catch (error) {
      console.error(error)
      return { outputs: this.outputs, error }
    }
    return { outputs: this.outputs, error: null }
  }
}
