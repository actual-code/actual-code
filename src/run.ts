import remark from './markdown'
import { createSandbox, SandboxOptions } from './sandbox'

const traversal = (node, parent, cb, index = 0) => {
  cb(node, parent, index)
  ;(node.children || []).forEach((child, index) =>
    traversal(child, node, cb, index)
  )
}
const createErrorNode = value => ({ type: 'code', lang: 'error', value })
const createResultNode = outputs => ({
  type: 'code',
  value: outputs.map(({ name, value }) => `-- ${name}\n${value}`).join('\n')
})

const lang = {
  js: 'js',
  javascript: 'js',
  ts: 'ts',
  typescript: 'ts',
  jsx: 'jsx',
  tsx: 'tsx',
  sh: 'sh',
  shell: 'sh',
  bash: 'sh'
}

export const run = (markdownText: string, sandboxOpts: SandboxOptions = {}) => {
  const box = createSandbox(sandboxOpts)
  const vfile = remark.parse(markdownText)
  const results = []
  const nodes = []
  traversal(vfile, vfile, (node, parent, index) => {
    if (node.type === 'code' && node.lang in lang) {
      const filetype = lang[node.lang]
      const { outputs, error } = box(node.value, filetype)
      const { start, end } = node.position
      if (error) {
        nodes.push({ parent, index, node: createErrorNode(error) })
      } else {
        results.push({ outputs, start: start.offset, end: end.offset })
        if (outputs.length > 0) {
          nodes.push({ parent, index, node: createResultNode(outputs) })
        }
      }
    }
  })

  nodes.reverse().forEach(({ parent, index, node }) => {
    parent.children = [
      ...parent.children.slice(0, index + 1),
      node,
      ...parent.children.slice(index + 1)
    ]
  })
  return { results, vfile }
}
