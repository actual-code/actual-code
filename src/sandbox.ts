import * as fs from 'fs'
import * as path from 'path'
import * as vm from 'vm'
import { Writable } from 'stream'

import * as babel from '@babel/core'

export interface Output {
  name: string
  value: string
}

export const createSandbox = () => {
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
          return process[name]
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
    require,
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
  return (code: string, filetype: string = 'js') => {
    const compiled = babel.transformSync(code, {
      presets: [
        ['@babel/preset-env', { targets: { node: '8.0.0' } }],
        '@babel/preset-typescript'
      ],
      filename: `file.${filetype}`
    })
    outputs = []
    try {
      vm.runInContext(compiled.code, ctx, { timeout: 3000 })
    } catch (error) {
      return { outputs, error: error.toString() }
    }
    return { outputs, error: null }
  }
}
