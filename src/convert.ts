import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import unified from 'unified'
import stringify from 'remark-stringify'
import { safeLoad } from 'js-yaml'

import { run } from './run'
import { setup } from './setup'
import { Reporter } from './reporter'
import { Sandbox, SandboxOptions, createSandbox } from './sandbox'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const reFrontmatter = /^---\n(.*)\n---\n/

export const runMarkdown = async (
  code: string,
  box: Sandbox,
  reporter: Reporter
) => {
  const cwd = process.cwd()

  const matched = reFrontmatter.exec(code)
  const settings = matched ? safeLoad(matched[1]) : {}

  if (matched) {
    code = code.slice(matched[0].length)
  }

  reporter.info('run')
  const { vfile } = await run(code, box, { settings })

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
    settings: {}
  }
  const box = createSandbox(reporter, sandboxOpts)

  const vfile = await runMarkdown(text, box, reporter)

  const doc = unified()
    .use(stringify)
    .stringify(vfile)

  if (outputfile) {
    reporter.info(`write ${outputfile}`)
    await writeFile(outputfile, doc)
  }
  return doc
}

export const getSettings = (text: string) => {}
