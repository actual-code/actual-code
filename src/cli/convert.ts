import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import assert from 'assert'

import { Reporter } from '../reporter'
import { SandboxOptions } from '../'
import { stringifyMarkdown } from '../source/unified'
import { ActualCode } from '../actual-code'
import { CodeBlock } from '../source'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export const convert = async (filename: string, opts, outputfile?: string) => {
  const reporter = new Reporter(opts)

  let outputs = []
  let vfile = null
  let codeBlocks: CodeBlock[] = null
  const inserts = []

  reporter.setCallback((type, hash, arg1) => {
    switch (type) {
      case 'sandbox end': {
        assert(hash)

        const codeBlock = codeBlocks.find(v => v.hash === hash)

        assert(codeBlock)

        inserts.push({
          parent: codeBlock.parent,
          index: codeBlock.index,
          outputs: [...outputs]
        })

        outputs = []
        hash = null
        break
      }
      case 'stdout': {
        outputs.push({ type: 'stdout', hash, value: arg1.toString() })
        break
      }
      case 'stderr': {
        outputs.push({ type: 'stderr', hash, value: arg1.toString() })
        break
      }
    }
  })

  filename = path.resolve(filename)
  if (outputfile) {
    outputfile = path.resolve(outputfile)
  }

  let text = (await readFile(filename)).toString()
  if (text.startsWith('#! ') && reporter.disableDebug) {
    reporter.disableLog = true
    reporter.disableInfo = true
  }
  reporter.info('read file', filename)
  const actualCode = new ActualCode(filename, reporter)
  const appState = await actualCode.getAppState()

  const sandboxOpts: SandboxOptions = {
    rootPath: appState.path,
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
