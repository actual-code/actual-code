import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import { setup } from './app-state'
import { Reporter } from './reporter'
import { Sandbox, SandboxOptions, createSandbox } from './sandbox'
import { stringifyMarkdown } from './markdown'
import { createMarkdownRunner } from './markdown/runner'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export const convert = async (filename: string, opts, outputfile?: string) => {
  const reporter = new Reporter(opts)

  filename = path.resolve(filename)
  if (outputfile) {
    outputfile = path.resolve(outputfile)
  }

  reporter.info(`read: ${filename}`)
  let text = (await readFile(filename)).toString()
  const appState = await setup(filename)

  const sandboxOpts: SandboxOptions = {
    rootPath: appState.path,
    runMode: true
  }
  const { run } = await createMarkdownRunner(filename, appState, reporter)

  const vfile = await run(text, sandboxOpts)

  const doc = stringifyMarkdown(vfile)

  if (outputfile) {
    reporter.info(`write ${outputfile}`)
    await writeFile(outputfile, doc)
  }
  return doc
}
