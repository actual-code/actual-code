import * as fs from 'fs'
import { promisify } from 'util'

import { JsSandbox } from './node-js'
import { ShellSandbox } from './shell'
import { HtmlSandbox } from './html'
import { BrowserSandbox } from './browser'
import { Reporter } from '../reporter'

const writeFile = promisify(fs.writeFile)

export interface Output {
  name: string
  value: string
}

export interface SandboxOptions {
  rootPath?: string
  timeout?: number
  runMode?: boolean
  browser?: boolean
  file?: string
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
  rootPath: string
): Sandbox => {
  reporter.debug('create Sandbox')
  const jsBox = new JsSandbox(reporter, rootPath)
  const shBox = new ShellSandbox(reporter)
  const htmlBox = new HtmlSandbox(reporter)
  const browserSandbox = new BrowserSandbox(reporter, rootPath)
  return {
    run: async (
      code: string,
      filetype: string = 'js',
      opts2: SandboxOptions
    ) => {
      reporter.info(`run ${filetype}`)

      if (opts2.file) {
        await writeFile(opts2.file, code)
      }

      if (opts2.browser) {
        return browserSandbox.run(code, filetype, opts2)
      }

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
