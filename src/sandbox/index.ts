import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'

const mkdtemp = promisify(fs.mkdtemp)

import jsPlugin from './node-js'
import shellPlugin from './shell'
import htmlPlugin from './html'
import { Reporter } from '../reporter'

const writeFile = promisify(fs.writeFile)

export interface SandboxOptions {
  rootPath?: string
  timeout?: number
  runMode?: boolean
  browser?: boolean
  file?: string
  // settings: { [props: string]: string }
}

export interface Sandbox {
  rootPath: string
  run: (
    code: string,
    hash: string,
    filetype: string,
    meta: SandboxOptions
  ) => Promise<boolean>
}

export type SandboxPlugin = (
  reporter: Reporter,
  rootPath: string
) => Promise<Sandbox>

export const createSandbox = async (
  reporter: Reporter,
  rootPath?: string
): Promise<Sandbox> => {
  reporter.debug('create Sandbox')

  if (!rootPath || !fs.existsSync(rootPath)) {
    rootPath = await mkdtemp(path.join(os.tmpdir(), 'actual-'))
  }

  const jsBox = await jsPlugin(reporter, rootPath)
  const shBox = await shellPlugin(reporter, rootPath)
  const htmlBox = await htmlPlugin(reporter, rootPath)

  const boxes = [jsBox, shBox, htmlBox]
  return {
    rootPath,
    run: async (
      code: string,
      hash: string,
      filetype: string,
      opts: SandboxOptions
    ) => {
      if (!opts.runMode) {
        reporter.info('sandbox skip', hash)
        return false
      }

      reporter.info('sandbox run', hash)

      if (opts.file) {
        await writeFile(opts.file, code)
      }

      for (const box of boxes) {
        if (await box.run(code, hash, filetype, opts)) {
          break
        }
      }
      reporter.info('sandbox end', hash)
      return true
    }
  }
}
