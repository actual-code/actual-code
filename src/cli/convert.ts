import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import { setup } from '../app-state'
import { ConsoleReporter } from '../reporter'
import { SandboxOptions } from '../sandbox'
import { stringifyMarkdown } from '../source/markdown'
import { ActualCode } from '../actual-code'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export const convert = async (filename: string, opts, outputfile?: string) => {
  const reporter = new ConsoleReporter(opts)

  filename = path.resolve(filename)
  if (outputfile) {
    outputfile = path.resolve(outputfile)
  }

  let text = (await readFile(filename)).toString()
  if (text.startsWith('#! ') && reporter.disableDebug) {
    reporter.disableLog = true
    reporter.disableInfo = true
  }
  reporter.info(`read: ${filename}`)
  const appState = await setup(filename)

  const sandboxOpts: SandboxOptions = {
    rootPath: appState.path,
    runMode: true
  }
  const actualCode = new ActualCode(appState, reporter)

  const { vfile } = await actualCode.run(text, sandboxOpts)

  const doc = stringifyMarkdown(vfile)

  if (outputfile) {
    reporter.info(`write ${outputfile}`)
    await writeFile(outputfile, doc)
  }
  return doc
}
