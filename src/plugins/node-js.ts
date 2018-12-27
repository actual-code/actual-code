import * as fs from 'fs'
import * as path from 'path'
import * as vm from 'vm'
import { Writable } from 'stream'
import { inspect } from 'util'

import * as babel from '@babel/core'

const presetEnv = require('@babel/preset-env')
const presetTypescript = require('@babel/preset-typescript')

import { Sandbox, SandboxOptions, SandboxPlugin } from '../actual-code'
import { Reporter } from '../reporter'

const createProxies = (reporter: Reporter) => {
  const createWritable = name => {
    return new Writable({
      write: value => {
        reporter.output(name, value)
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
        const format = (value: any) => {
          if (typeof value === 'string') {
            return value
          } else {
            return inspect(value, { colors: false })
          }
        }
        reporter.output('stdout', `${args.map(arg => format(arg)).join(' ')}\n`)
      }
    }
  })

  return { processProxy, consoleProxy }
}

const createRequire = (rootPath: string) => {
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

    // FIXME: actual-code library
    // if (name === 'actual-code') {
    //   return actualCodeObject
    // }
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
  rootPath: string
  filetypes = {
    js: 'js',
    javascript: 'js',
    ts: 'ts',
    typescript: 'ts',
    jsx: 'jsx',
    tsx: 'tsx'
  }
  reporter: Reporter
  timeout: number
  ctx: any
  constructor(reporter: Reporter, rootPath: string) {
    this.rootPath = rootPath
    this.reporter = reporter
    this.timeout = 100

    const { consoleProxy, processProxy } = createProxies(reporter)
    const requireSandbox = createRequire(rootPath)
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

  async run(
    code: string,
    hash: string,
    filetype: string,
    meta: SandboxOptions
  ) {
    filetype = this.filetypes[filetype]
    if (!filetype) {
      return false
    }
    try {
      const compiled = await babel.transformAsync(code, {
        ast: false,
        presets: [
          [
            presetEnv,
            {
              targets: {
                node: process.version,
                browsers: ['last 2 Chrome version']
              }
            }
          ],
          presetTypescript
        ],
        sourceType: 'module',
        filename: `file.${filetype}`
      })
      const timeout = meta.timeout || this.timeout
      vm.runInContext(compiled.code, this.ctx, { timeout })
    } catch (error) {
      this.reporter.output('stderr', inspect(error, { colors: false }))
    }
    return true
  }
}

const plugin: SandboxPlugin = async (reporter, rootPath) => {
  return new JsSandbox(reporter, rootPath)
}

export default plugin
