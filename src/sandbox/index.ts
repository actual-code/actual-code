import { createNodeJsSandbox } from './node-js'
import { createShellSandbox } from './shell'

export interface Output {
  name: string
  value: string
}

export interface SandboxOptions {
  rootPath?: string
  timeout?: number
}

export const createSandbox = (opts: SandboxOptions = {}) => {
  const jsBox = createNodeJsSandbox(opts)
  const shBox = createShellSandbox(opts)
  return async (
    code: string,
    filetype: string = 'js',
    opts2: SandboxOptions = {}
  ) => {
    if (filetype === 'sh') {
      return shBox(code, filetype, opts2)
    } else {
      return jsBox(code, filetype, opts2)
    }
  }
}
