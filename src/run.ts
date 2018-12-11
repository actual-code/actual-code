import remark from './markdown'
import { createSandbox, SandboxOptions } from './sandbox'

const traversal = (node, parent, cb, index = 0) => {
  cb(node, parent, index)
  ;(node.children || []).forEach((child, index2) =>
    traversal(child, node, cb, index2)
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

const reKeyValue = /^(([a-zA-Z0-9]+)(?:=([^" ]+)|="([^"]+)")?)/
export const parseMeta = (meta: string): { [props: string]: any } => {
  if (!meta) {
    return {}
  }
  meta = meta.toString().trim()
  if (meta.slice(0, 1) !== '{' || meta.slice(-1) !== '}') {
    return {}
  }
  meta = meta.slice(1, -1)
  const results: { [props: string]: any } = {}
  let matched
  while ((matched = reKeyValue.exec(meta))) {
    const key = matched[2]
    const value = matched[3] || matched[4] || true
    results[key] = value
    meta = meta.slice(matched[1].length).trimLeft()
  }
  return results
}

export const run = (markdownText: string, sandboxOpts: SandboxOptions = {}) => {
  const box = createSandbox(sandboxOpts)
  const vfile = remark.parse(markdownText)
  const results = []
  const nodes = []
  traversal(vfile, vfile, (node, parent, index) => {
    if (node.type === 'code' && node.lang in lang) {
      const meta = parseMeta(node.meta)
      console.log(node.meta, meta)
      const filetype = lang[node.lang]
      const { outputs, error } = box(node.value, filetype)
      const { start, end } = node.position
      if (error) {
        nodes.push({ parent, index, node: createErrorNode(error) })
      } else {
        results.push({ outputs, start: start.offset, end: end.offset })
        if (outputs.length > 0 && !meta.quiet) {
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
