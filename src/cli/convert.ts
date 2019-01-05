import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import assert from 'assert'

import { Reporter, ReporterOptions } from '../actual-code/reporter'
import { SandboxOptions } from '../actual-code/sandbox'
import { stringifyMarkdown, MDAST } from '../source/unified'
import { ActualCode, ResultProcessorPlugin } from '../actual-code'
import { CodeBlock } from '../source'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const getTime = () => {
  const date = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`
}

export const convert = async (
  filename: string,
  opts: ReporterOptions,
  outputfile?: string
) => {
  const reporter = new Reporter()

  let outputs = []
  let vfile = null
  let codeBlocks: CodeBlock[] = null
  const inserts = []

  filename = path.resolve(filename)
  if (outputfile) {
    outputfile = path.resolve(outputfile)
  }

  let text = (await readFile(filename)).toString()
  if (text.startsWith('#! ') && opts.disableDebug) {
    opts.disableLog = true
    opts.disableInfo = true
  }

  reporter.info('read file', filename)
  const actualCode = new ActualCode(filename, reporter)

  const sandboxOpts: SandboxOptions = {
    runMode: true
  }

  actualCode.registerPlugin(() => ({
    name: 'actual-code CLI',
    resultProcessor: async (root, codeBlocks) => {
      return {
        transform: async ({ filetype, data, hash }) => {
          switch (filetype) {
            case 'log': {
              if (!opts.disableLog) {
                process.stdout.write(
                  `\x1b[36m[LOG]  ${getTime()}\x1b[m: ${data}\n`
                )
              }
              return null
            }
            case 'debug': {
              if (!opts.disableDebug) {
                process.stdout.write(
                  `\x1b[33m[DEBUG]${getTime()}\x1b[m: ${data}\n`
                )
              }
              return null
            }
            default: {
              if (!opts.disableInfo) {
                process.stdout.write(
                  `\x1b[32m[INFO] ${getTime()}\x1b[m: ${filetype}${
                    hash ? `.${hash}` : ''
                  }${hash === data ? '' : ` ${data}`}\n`
                )
              }
              return null
            }
            case 'stdout': {
              process.stdout.write(data.toString())
              return { filetype, data, hash }
            }
            case 'stderr': {
              process.stderr.write(data.toString())
              return { filetype, data, hash }
            }
          }
        },
        output: async results => {
          if (results) {
            codeBlocks.reverse().forEach(codeBlock => {
              if (codeBlock.hash in results) {
                const { data } = results[codeBlock.hash].reduce(
                  (acc, res) => {
                    let data = acc.data
                    if (acc.filetype !== res.filetype) {
                      if (data.length > 0) {
                        data += '\n'
                      }
                      data += `---${res.filetype}\n`
                    }
                    data += res.data
                    return { filetype: res.filetype, data }
                  },
                  { filetype: '', data: '' }
                )
                const node: MDAST.Code = {
                  type: 'code',
                  value: data
                }
                codeBlock.parent.children = [
                  ...codeBlock.parent.children.slice(0, codeBlock.index + 1),
                  node,
                  ...codeBlock.parent.children.slice(codeBlock.index + 1)
                ]
              }
            })
          }
          return stringifyMarkdown(root)
        }
      }
    }
  }))

  await actualCode.run(text, sandboxOpts)
  const doc = await actualCode.waitFinished()

  if (outputfile) {
    reporter.info('write file', outputfile)
    await writeFile(outputfile, doc)
  }
  return doc
}
