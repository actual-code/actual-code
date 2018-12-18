import { Reporter } from '../reporter'
import { Sandbox, SandboxOptions } from '../sandbox'

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
  cache,
  codeBlocks,
  opts: SandboxOptions
) => {
  const cwd = process.cwd()

  reporter.debug('run markdown script')

  const insertNodes = []
  let i = 0
  for (const codeBlock of codeBlocks) {
    const { code, filetype, meta, parent, index } = codeBlock
    const opts2 = mergeOption(opts, meta)

    let outputs = []
    let error = null
    let nodes = []

    if (opts2.runMode) {
      const result = await box.run(code, filetype, opts2)
      outputs = result.outputs
      error = result.error
      nodes = result.nodes

      cache[i] = { outputs, code }
    } else {
      if (cache.length > i) {
        if (cache[i].code !== code) {
          // cache purge
          cache[i] = { code: null, outputs: [] }
        }
        outputs = cache[i].outputs
        error = cache[i].error
        nodes = cache[i].nodes
      }
    }

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

  process.chdir(cwd)
}
