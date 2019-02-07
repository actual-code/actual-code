import * as fs from 'fs'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

import {
  stringifyMarkdown,
  MDAST,
  CodeBlock,
  insertAfter,
} from '@actual-code/source'
import { Results } from '@actual-code/core'

export const convert = async (
  root: MDAST.Root,
  codeBlocks: CodeBlock[],
  outputFilename: string,
  results: Results
) => {
  if (results) {
    codeBlocks.reverse().forEach(codeBlock => {
      if (codeBlock.hash in results) {
        const { data } = results[codeBlock.hash].reduce(
          (acc, res) => {
            if (res.type !== 'output') {
              return acc
            }

            let data = acc.data
            if (acc.filetype !== res.subType) {
              if (data.length > 0) {
                data += '\n'
              }
              data += `---${res.subType}\n`
            }
            data += res.data
            return { filetype: res.subType, data }
          },
          { filetype: '', data: '' }
        )
        const node: MDAST.Code = {
          type: 'code',
          value: data,
        }
        insertAfter(root, codeBlock.pointers, node)
      }
    })
  }
  await writeFile(outputFilename, stringifyMarkdown(root))
}
