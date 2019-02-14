import * as path from 'path'

import { serve } from '@actual-code/web'
import { MDAST, CodeBlock } from '@actual-code/source'
import { Results } from '@actual-code/core'

export const browser = async (
  root: MDAST.Root,
  codeBlocks: CodeBlock[],
  results: Results
) => {
  if (!results) {
    return
  }

  const obj = { root, codeBlocks, results }
  const json = JSON.stringify(obj)

  serve(json, path.join(process.cwd(), '.actual-code'))
}
