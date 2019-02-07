import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import { SandboxOptions } from '@actual-code/core'
import {
  stringifyMarkdown,
  MDAST,
  CodeBlock,
  insertAfter,
} from '@actual-code/source'
import {
  ActualCode,
  ActualCodePlugin,
  Transform,
  Output,
} from '@actual-code/core'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const getTime = () => {
  const date = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`
}

const actualCodeCliPlugin = (opts): ActualCodePlugin => () => {
  const transform: Transform = async ({
    type,
    subType,
    data,
    hash,
    payload,
  }) => {
    switch (type) {
      case 'log': {
        if (opts.isVerbose) {
          process.stdout.write(`\x1b[36m[LOG]  ${getTime()}\x1b[m: ${data}\n`)
        }
        return null
      }
      case 'debug': {
        if (opts.isVerbose) {
          process.stdout.write(`\x1b[33m[DEBUG]${getTime()}\x1b[m: ${data}\n`)
        }
        return null
      }
      case 'event': {
        if (opts.isVerbose) {
          process.stdout.write(
            `\x1b[32m[EVENT]${getTime()}\x1b[m: ${subType}${
              hash ? `.${hash}` : ''
            }${hash === data ? '' : ` ${data}`}\n`
          )
        }
        return null
      }
      case 'output': {
        if (subType === 'stdout') {
          process.stdout.write(data.toString())
        } else if (subType === 'stderr') {
          process.stderr.write(data.toString())
        }
        return { type, subType, data, hash }
      }
    }
  }
  const createOutput = (
    root: MDAST.Root,
    codeBlocks: CodeBlock[]
  ): Output => async results => {
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
    return stringifyMarkdown(root)
  }
  return {
    name: 'actual-code CLI',
    resultProcessor: async (root, codeBlocks) => {
      return {
        transform,
        output: createOutput(root, codeBlocks),
      }
    },
  }
}

export const convert = async (filename: string, opts, outputfile?: string) => {
  filename = path.resolve(filename)
  if (outputfile) {
    outputfile = path.resolve(outputfile)
  }

  const text = (await readFile(filename)).toString()

  // reporter.event('read file', { filename })
  const actualCode = new ActualCode(filename)

  const sandboxOpts: SandboxOptions = {
    runMode: true,
  }

  actualCode.registerPlugin(actualCodeCliPlugin(opts))

  await actualCode.run(text, sandboxOpts)
  const doc = await actualCode.waitFinished()

  if (outputfile) {
    // reporter.event('write file', { filename: outputfile })
    await writeFile(outputfile, doc)
  }
  return doc
}
