import * as fs from 'fs'
import { promisify } from 'util'

import { safeLoad } from 'js-yaml'

import { parseMarkdown } from '.'

const writeFile = promisify(fs.writeFile)

const traversal = async (node, parent, cb, index = 0) => {
  await cb(node, parent, index)
  let i = 0
  for (const child of node.children || []) {
    await traversal(child, node, cb, i)
    i++
  }
}
const lang = {
  js: 'js',
  javascript: 'js',
  ts: 'ts',
  typescript: 'ts',
  jsx: 'jsx',
  tsx: 'tsx',
  sh: 'sh',
  shell: 'sh',
  bash: 'sh',
  html: 'html'
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

const reFrontmatter = /^---\n(.*)\n---\n/

export const parse = async (markdownText: string) => {
  const matched = reFrontmatter.exec(markdownText)
  const settings = matched ? safeLoad(matched[1]) : {}

  if (matched) {
    markdownText = markdownText.slice(matched[0].length)
  }

  const vfile = parseMarkdown(markdownText)
  return { settings, vfile }
}

export const getCodeBlocks = async vfile => {
  const codeBlocks = []
  await traversal(vfile, vfile, async (node, parent, index) => {
    if (node.type !== 'code') {
      return
    }

    const meta = parseMeta(node.meta)
    if (meta.file) {
      await writeFile(meta.file, node.value)
    }

    if (meta.noexec || !(node.lang in lang)) {
      return
    }

    const filetype = lang[node.lang]
    if (meta.timeout) {
      meta.timeout = Number.parseInt(meta.timeout)
    }
    if (typeof meta.runMode === 'string') {
      meta.runMode = meta.runMode === 'true'
    }

    codeBlocks.push({ code: node.value, filetype, meta, parent, index })
  })
  return codeBlocks
}
