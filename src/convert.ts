import * as fs from 'fs'
import { promisify } from 'util'

import unified from 'unified'
import stringify from 'remark-stringify'
import { safeLoad } from 'js-yaml'

import { run } from './run'
import { setup } from './setup'

const readFile = promisify(fs.readFile)

export const convert = async (filename: string) => {
  const reFrontmatter = /^---\n(.*)\n---\n/
  let text = (await readFile(filename)).toString()

  const matched = reFrontmatter.exec(text)
  const settings = matched ? safeLoad(matched[1]) : {}
  // console.log(settings)

  if (matched) {
    text = text.slice(matched[0].length)
  }

  const appState = await setup(filename)

  const { vfile } = await run(text, { rootPath: appState.path })
  const doc = unified()
    .use(stringify)
    .stringify(vfile)
  return doc
}

export const getSettings = (text: string) => {}
