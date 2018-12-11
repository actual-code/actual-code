import * as fs from 'fs'
import { promisify } from 'util'

import remark from './markdown'
import { createSandbox, SandboxOptions } from './sandbox'

const writeFile = promisify(fs.writeFile)

const traversal = async (node, parent, cb, index = 0) => {
  await cb(node, parent, index)
  let i = 0
  for (const child of node.children || []) {
    await traversal(child, node, cb, i)
    i++
  }
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

export const run = async (
  markdownText: string,
  sandboxOpts: SandboxOptions = {}
) => {
  const box = createSandbox(sandboxOpts)
  const vfile = remark.parse(markdownText)
  const results = []
  const nodes = []
  await traversal(vfile, vfile, async (node, parent, index) => {
    if (node.type === 'code') {
      const meta = parseMeta(node.meta)
      if (meta.file) {
        await writeFile(meta.file, node.value)
      }
    }

    if (node.type === 'code' && node.lang in lang) {
      const meta = parseMeta(node.meta)
      const filetype = lang[node.lang]
      const opts: any = {}
      if (meta.timeout) {
        opts.timeeout = Number.parseInt(meta.timeout)
      }
      const { outputs, error } = await box(node.value, filetype, opts)
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
