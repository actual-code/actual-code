import { Reporter } from '../reporter'
import { Sandbox, SandboxOptions } from '../sandbox'
import { CodeBlock } from '../source'

const createErrorNode = value => ({ type: 'code', lang: 'error', value })
const createResultNode = outputs => ({
  type: 'code',
  value: outputs.map(({ name, value }) => `-- ${name}\n${value}`).join('\n')
})

const mergeOption = (
  opt1: SandboxOptions,
  opt2: SandboxOptions
): SandboxOptions => {
  // console.log(opt1)
  // console.log(opt2)
  return {
    rootPath: opt2.rootPath || opt1.rootPath,
    timeout: opt2.timeout || opt1.timeout,
    runMode: 'runMode' in opt2 ? opt2.runMode : opt1.runMode,
    browser: opt2.browser || opt1.browser,
    file: opt2.file
  }
}

export const run = async (
  reporter: Reporter,
  box: Sandbox,
  codeBlocks: CodeBlock[],
  opts: SandboxOptions
) => {
  const cwd = process.cwd()

  reporter.debug('run markdown script')

  const insertNodes = []
  let i = 0
  for (const codeBlock of codeBlocks) {
    const { code, filetype, meta, parent, index, hash } = codeBlock
    const opts2 = mergeOption(opts, meta)

    let outputs = []
    let error = null
    let nodes = []

    reporter.setHash(hash)
    await box.run(code, hash, filetype, opts2)

    if (error) {
      insertNodes.push({ parent, index, node: createErrorNode(error) })
    } else {
      if (outputs.length > 0 && !meta.quiet) {
        insertNodes.push({ parent, index, node: createResultNode(outputs) })
      }
      nodes.forEach(node => {
        insertNodes.push({ parent, index, node })
      })
    }

    i++
  }

  insertNodes.reverse().forEach(({ parent, index, node }) => {
    parent.children = [
      ...parent.children.slice(0, index + 1),
      node,
      ...parent.children.slice(index + 1)
    ]
  })

  reporter.setHash(null)
  process.chdir(cwd)
}
