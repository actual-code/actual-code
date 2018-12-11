import * as fs from 'fs'
import { promisify } from 'util'

import unified from 'unified'
import stringify from 'remark-stringify'

import { run } from './run'
import { setup } from './setup'

const readFile = promisify(fs.readFile)

export const convert = async (filename: string) => {
  const text = (await readFile(filename)).toString()
  const appState = await setup(filename)

  const { vfile } = await run(text, { rootPath: appState.path })
  const doc = unified()
    .use(stringify)
    .stringify(vfile)
  return doc
}
