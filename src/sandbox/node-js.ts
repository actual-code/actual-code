import * as fs from 'fs'
import * as path from 'path'
import * as vm from 'vm'
import { Writable } from 'stream'

import * as babel from '@babel/core'
// import shellEscape from 'shell-escape'

const presetEnv = require('@babel/preset-env')
const presetTypescript = require('@babel/preset-typescript')

import { Output, SandboxOptions } from '.'
import { Reporter } from '../reporter'

export const createNodeJsSandbox = (
  reporter: Reporter,
  opts: SandboxOptions = {}
) => {
  const rootPath = path.resolve(opts.rootPath || process.cwd())

  let outputs: Output[] = []
  const createWritable = name => {
    return new Writable({
      write: value => {
        reporter[name].write(value)
        outputs.push({ name, value })
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
        // FIXME
        console[name](...args)
        outputs.push({
          name: `console.${name.toString()}`,
          value: args.join(' ')
        })
      }
    }
  })

  const ctx: any = {
    require(name: string) {
      const validatePath = (p: string) => {
        if (p.startsWith(rootPath)) {
          return
        }
        if (p.startsWith(path.resolve(path.join(__dirname, '..')))) {
          return
        }

        throw new Error(`Sandbox Error: Illegal path ${name}`)
      }

      if (name.startsWith('./') || name.startsWith('../')) {
        const fullPath = require.resolve(name)
        validatePath(fullPath)
        return require(fullPath)
      }

      if (name.startsWith('/') || name.startsWith('.')) {
        throw new Error('Sandbox Error: Illegal path')
      }

      const fullpath = path.resolve(path.join(rootPath, 'node_modules', name))
      if (fs.existsSync(fullpath)) {
        validatePath(fullpath)
        return require(fullpath)
      } else {
        return require(name)
      }
    },
    setTimeout,
    setInterval,
    setImmediate,
    clearTimeout,
    clearInterval,
    clearImmediate,
    process: processProxy,
    Buffer,
    console: consoleProxy
  }
  vm.createContext(ctx)
  return async (code: string, filetype: string, opts2: any = {}) => {
    outputs = []
    reporter.info(`run ${filetype}`)
    const compiled = await babel.transformAsync(code, {
      ast: false,
      presets: [[presetEnv, { targets: { node: '8.0.0' } }], presetTypescript],
      sourceType: 'module',
      filename: `file.${filetype}`
    })
    try {
      const timeout = opts2.timeout || opts.timeout || 100
      vm.runInContext(compiled.code, ctx, { timeout })
    } catch (error) {
      console.log(error)
      return { outputs, error }
    }
    return { outputs, error: null }
  }
}
