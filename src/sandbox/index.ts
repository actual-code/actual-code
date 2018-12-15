import * as path from 'path'
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
  opts: SandboxOptions = { runMode: true }
): Sandbox => {
  reporter.info('create Sandbox')
  console.log(opts)
  const jsBox = new JsSandbox(reporter, opts)
  const shBox = new ShellSandbox(reporter, opts)
  const htmlBox = new HtmlSandbox(reporter, opts)
  const browserSandbox = new BrowserSandbox(reporter, opts)
  return {
    run: async (
      code: string,
      filetype: string = 'js',
      opts2: SandboxOptions = { runMode: true }
    ) => {
      reporter.info(`sandbox run ${filetype}`)
      console.log(opts2)
      if (!opts2.runMode) {
        reporter.info('sandbox run mode disabled.')
        return { outputs: [], error: null, nodes: [] }
      }

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
