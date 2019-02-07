import * as fs from 'fs'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

import { MDAST, CodeBlock } from '@actual-code/source'
import { Results } from '@actual-code/core'

export const output = async (
  filename: string,
  root: MDAST.Root,
  codeBlocks: CodeBlock[],
  results: Results
) => {
  if (!results) {
    return
  }
  const obj = {
    source: root,
    codeBlocks,
    results,
  }
  await writeFile(filename, JSON.stringify(obj, null, '  '))
}
