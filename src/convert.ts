import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import { safeLoad } from 'js-yaml'

import { run } from './run'
import { setup } from './setup'
import { Reporter } from './reporter'
import { Sandbox, SandboxOptions, createSandbox } from './sandbox'
import { stringifyMarkdown } from './markdown'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const reFrontmatter = /^---\n(.*)\n---\n/

export const runMarkdown = async (
  code: string,
  box: Sandbox,
  reporter: Reporter,
  opts: SandboxOptions = {}
) => {
  const cwd = process.cwd()

  const matched = reFrontmatter.exec(code)
  // const opts: SandboxOptions = {
  //   settings: matched ? safeLoad(matched[1]) : {}
  // }

  if (matched) {
    code = code.slice(matched[0].length)
  }

  reporter.info('run')
  const { vfile } = await run(code, box, opts)

  process.chdir(cwd)

  return vfile
}

export const convert = async (filename: string, outputfile?: string) => {
  const reporter = new Reporter()

  filename = path.resolve(filename)

  reporter.info(`read: ${filename}`)
  let text = (await readFile(filename)).toString()
  const appState = await setup(filename)

  const sandboxOpts: SandboxOptions = {
    rootPath: appState.rootPath,
    runMode: true
  }
  const box = createSandbox(reporter, sandboxOpts)

  const vfile = await runMarkdown(text, box, reporter)

  const doc = stringifyMarkdown(vfile)

  if (outputfile) {
    reporter.info(`write ${outputfile}`)
    await writeFile(outputfile, doc)
  }
  return doc
}
