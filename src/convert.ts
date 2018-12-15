import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import { setup } from './setup'
import { Reporter } from './reporter'
import { Sandbox, SandboxOptions, createSandbox } from './sandbox'
import { stringifyMarkdown } from './markdown'
import { runMarkdown } from './markdown/runner'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export const convert = async (filename: string, outputfile?: string) => {
  const reporter = new Reporter()

  filename = path.resolve(filename)
  if (outputfile) {
    outputfile = path.resolve(outputfile)
  }

  reporter.info(`read: ${filename}`)
  let text = (await readFile(filename)).toString()
  const appState = await setup(filename)

  const sandboxOpts: SandboxOptions = {
    rootPath: appState.rootPath,
    runMode: true
  }
  const box = createSandbox(reporter, sandboxOpts)

  const vfile = await runMarkdown(text, box, reporter, sandboxOpts)

  const doc = stringifyMarkdown(vfile)

  if (outputfile) {
    reporter.info(`write ${outputfile}`)
    await writeFile(outputfile, doc)
  }
  return doc
}
