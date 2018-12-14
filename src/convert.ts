import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import unified from 'unified'
import stringify from 'remark-stringify'
import { safeLoad } from 'js-yaml'

import { run } from './run'
import { setup } from './setup'
import { Reporter } from './reporter'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const reFrontmatter = /^---\n(.*)\n---\n/

export const runMarkdown = async (
  code: string,
  reporter: Reporter,
  rootPath: string
) => {
  const cwd = process.cwd()

  const matched = reFrontmatter.exec(code)
  const settings = matched ? safeLoad(matched[1]) : {}

  if (matched) {
    code = code.slice(matched[0].length)
  }

  reporter.info('run')
  const { vfile } = await run(code, { rootPath, settings }, reporter)

  process.chdir(cwd)

  return vfile
}

export const convert = async (filename: string, outputfile?: string) => {
  const reporter = new Reporter()

  filename = path.resolve(filename)

  reporter.info(`read: ${filename}`)
  let text = (await readFile(filename)).toString()
  const appState = await setup(filename)

  const vfile = await runMarkdown(text, reporter, appState.rootPath)

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
