import { createNodeJsSandbox } from './node-js'
import { createShellSandbox } from './shell'
import { Reporter } from '../reporter'

export interface Output {
  name: string
  value: string
}

export interface SandboxOptions {
  rootPath?: string
  timeout?: number
  settings: { [props: string]: string }
}

export const createSandbox = (
  reporter: Reporter,
  opts: SandboxOptions = { settings: {} }
) => {
  const jsBox = createNodeJsSandbox(reporter, opts)
  const shBox = createShellSandbox(reporter, opts)
  return async (
    code: string,
    filetype: string = 'js',
    opts2: SandboxOptions = { settings: {} }
  ) => {
    if (filetype === 'sh') {
      return shBox(code, filetype, opts2)
    } else {
      return jsBox(code, filetype, opts2)
    }
  }
}
