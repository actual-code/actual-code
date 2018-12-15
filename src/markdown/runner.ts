import { Reporter } from '../reporter'
import { getCodeBlocks, parse } from './parse'
import { Sandbox, SandboxOptions, createSandbox } from '../sandbox'

const createErrorNode = value => ({ type: 'code', lang: 'error', value })
const createResultNode = outputs => ({
  type: 'code',
  value: outputs.map(({ name, value }) => `-- ${name}\n${value}`).join('\n')
})

export const runMarkdown = async (
  markdownText: string,
  box: Sandbox,
  reporter: Reporter,
  opts: SandboxOptions = {}
) => {
  const cwd = process.cwd()

  reporter.info('run markdown')

  const { vfile } = await parse(markdownText)
  const codeBlocks = await getCodeBlocks(vfile)

  const insertNodes = []
  for (const codeBlock of codeBlocks) {
    const { code, filetype, meta, parent, index } = codeBlock
    const { outputs, error, nodes } = await box.run(code, filetype, {
      ...opts,
      ...meta
    })
    if (error) {
      insertNodes.push({ parent, index, node: createErrorNode(error) })
    } else {
      if (outputs.length > 0 && !meta.quiet) {
        insertNodes.push({ parent, index, node: createResultNode(outputs) })
      }
      nodes.forEach(node => {
        insertNodes.push({ parent, index, node })
        // console.log(JSON.stringify(node, null, '  '))
      })
    }
  }

  insertNodes.reverse().forEach(({ parent, index, node }) => {
    parent.children = [
      ...parent.children.slice(0, index + 1),
      node,
      ...parent.children.slice(index + 1)
    ]
  })

  process.chdir(cwd)

  return vfile
}
