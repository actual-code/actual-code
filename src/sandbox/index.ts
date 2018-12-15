import { JsSandbox } from './node-js'
import { ShellSandbox } from './shell'
import { HtmlSandbox } from './html'
import { Reporter } from '../reporter'

export interface Output {
  name: string
  value: string
}

export interface SandboxOptions {
  rootPath?: string
  timeout?: number
  runMode?: boolean
  // settings: { [props: string]: string }
}

export interface SandboxResult {
  outputs: Output[]
  error?: Error
  nodes: any[]
}

export interface Sandbox {
  run: (code: string, filetype: string, meta) => Promise<SandboxResult>
}

export const createSandbox = (
  reporter: Reporter,
  opts: SandboxOptions = { runMode: true }
): Sandbox => {
  reporter.info('create Sandbox')
  const jsBox = new JsSandbox(reporter, opts)
  const shBox = new ShellSandbox(reporter, opts)
  const htmlBox = new HtmlSandbox(reporter, opts)
  return {
    run: async (
      code: string,
      filetype: string = 'js',
      opts2: SandboxOptions = { runMode: true }
    ) => {
      reporter.info(`sandbox run ${filetype}`)
      console.log(opts2)
      if (filetype === 'sh') {
        return shBox.run(code, filetype, opts2)
      } else if (filetype === 'html') {
        return htmlBox.run(code, filetype, opts2)
      } else {
        return jsBox.run(code, filetype, opts2)
      }
    }
  }
}
