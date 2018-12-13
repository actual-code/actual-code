import { JsSandbox } from './node-js'
import { ShellSandbox } from './shell'
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

export interface SandboxResult {
  outputs: Output[]
  error?: Error
}

export interface Sandbox {
  run: (code: string, filetype: string, meta) => Promise<SandboxResult>
}

export const createSandbox = (
  reporter: Reporter,
  opts: SandboxOptions = { settings: {} }
) => {
  const jsBox = new JsSandbox(reporter, opts)
  const shBox = new ShellSandbox(reporter, opts)
  return async (
    code: string,
    filetype: string = 'js',
    opts2: SandboxOptions = { settings: {} }
  ) => {
    if (filetype === 'sh') {
      return shBox.run(code, filetype, opts2)
    } else {
      return jsBox.run(code, filetype, opts2)
    }
  }
}
