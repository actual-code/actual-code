import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import assert from 'assert'

import { Reporter, ReporterOptions } from '../actual-code/reporter'
import { SandboxOptions } from '../actual-code/sandbox'
import { stringifyMarkdown } from '../source/unified'
import { ActualCode } from '../actual-code'
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

  reporter.addCallback((type, hash, arg1) => {
    switch (type) {
      case 'log': {
        if (!opts.disableLog) {
          process.stdout.write(`\x1b[36m[LOG]  ${getTime()}\x1b[m: ${arg1}\n`)
        }
        break
      }
      case 'debug': {
        if (!opts.disableDebug) {
          process.stdout.write(`\x1b[33m[DEBUG]${getTime()}\x1b[m: ${arg1}\n`)
        }
        break
      }
      case 'sandbox end': {
        assert(hash)

        // const codeBlock = codeBlocks.find(v => v.hash === hash)

        // assert(codeBlock)

        // inserts.push({
        //   parent: codeBlock.parent,
        //   index: codeBlock.index,
        //   outputs: [...outputs]
        // })

        outputs = []
        // FALLTHRU
      }
      default: {
        if (!opts.disableInfo) {
          process.stdout.write(
            `\x1b[32m[INFO] ${getTime()}\x1b[m: ${type}${
              hash ? `.${hash}` : ''
            }${hash === arg1 ? '' : ` ${arg1}`}\n`
          )
        }
        break
      }
      case 'stdout': {
        process.stdout.write(arg1.toString())
        outputs.push({ type: 'stdout', hash, value: arg1.toString() })
        break
      }
      case 'stderr': {
        process.stderr.write(arg1.toString())
        outputs.push({ type: 'stderr', hash, value: arg1.toString() })
        break
      }
    }
  })

  reporter.info('read file', filename)
  const actualCode = new ActualCode(filename, reporter)

  const sandboxOpts: SandboxOptions = {
    runMode: true
  }

  const res = await actualCode.run(text, sandboxOpts)
  vfile = res.node
  codeBlocks = res.codeBlocks

  await actualCode.waitFinished()

  inserts.reverse().forEach(({ parent, index, outputs }) => {
    const [, text] = outputs.reduce(
      (acc, insert) => {
        const { type, value } = insert
        if (acc[0] === type) {
          return [type, acc[1] + value]
        } else {
          return [type, `${acc[1]}\n--- ${type}\n${value}`]
        }
      },
      ['', '']
    )
    const node = {
      type: 'code',
      value: text
    }
    parent.children = [
      ...parent.children.slice(0, index + 1),
      node,
      ...parent.children.slice(index + 1)
    ]
  })

  const doc = stringifyMarkdown(vfile)

  if (outputfile) {
    reporter.info('write file', outputfile)
    await writeFile(outputfile, doc)
  }
  return doc
}
