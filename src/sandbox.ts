import childProcess from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as vm from 'vm'
import { Writable } from 'stream'

import * as babel from '@babel/core'
// import shellEscape from 'shell-escape'

const presetEnv = require('@babel/preset-env')
const presetTypescript = require('@babel/preset-typescript')

export interface Output {
  name: string
  value: string
}

export interface SandboxOptions {
  rootPath?: string
  timeout?: number
}

export const createSandbox = (opts: SandboxOptions = {}) => {
  const timeout = opts.timeout || 100
  const rootPath = path.resolve(opts.rootPath || process.cwd())

  let outputs: Output[] = []
  const createWritable = name => {
    return new Writable({ write: value => outputs.push({ name, value }) })
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
  return async (code: string, filetype: string = 'js') => {
    outputs = []
    if (filetype === 'sh') {
      code.split('\n').forEach(line => {
        line = line.trimLeft()
        if (line.startsWith('$ ')) {
          line = line.slice(2)
        }
        // shell escape
        // stderr > stdout
        try {
          const cmd = `${line} 2>&1`
          const value = childProcess.execSync(cmd).toString('utf-8')
          outputs.push({ name: line, value })
        } catch (error) {
          console.error(error)
          return { outputs, error }
        }
      })
      return { outputs, error: null }
    }
    const compiled = await babel.transformAsync(code, {
      ast: false,
      presets: [[presetEnv, { targets: { node: '8.0.0' } }], presetTypescript],
      sourceType: 'module',
      filename: `file.${filetype}`
    })
    try {
      vm.runInContext(compiled.code, ctx, { timeout })
    } catch (error) {
      console.log(error)
      return { outputs, error }
    }
    return { outputs, error: null }
  }
}
