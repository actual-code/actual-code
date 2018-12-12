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

export const convert = async (filename: string) => {
  const reporter = new Reporter()

  const cwd = process.cwd()
  filename = path.resolve(filename)
  const outFilenme = filename.replace(/\.([^.]+)$/, `.generated.$1`)

  const reFrontmatter = /^---\n(.*)\n---\n/
  reporter.info(`read: ${filename}`)
  let text = (await readFile(filename)).toString()

  const matched = reFrontmatter.exec(text)
  const settings = matched ? safeLoad(matched[1]) : {}

  if (matched) {
    text = text.slice(matched[0].length)
  }

  const appState = await setup(filename)

  reporter.info('run')
  const { vfile } = await run(
    text,
    { rootPath: appState.path, settings },
    reporter
  )
  const doc = unified()
    .use(stringify)
    .stringify(vfile)

  process.chdir(cwd)
  reporter.info(`write ${outFilenme}`)
  await writeFile(outFilenme, doc)
}

export const getSettings = (text: string) => {}
