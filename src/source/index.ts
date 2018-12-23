import { createHash } from 'crypto'

import { safeLoad } from 'js-yaml'

import { parseMarkdown } from './markdown'

const sha256 = (text: string) => {
  const hash = createHash('sha256')
  hash.write(text)
  return hash.digest().toString('hex')
}

const traversal = async (node, parent, cb, index = 0) => {
  await cb(node, parent, index)
  let i = 0
  for (const child of node.children || []) {
    await traversal(child, node, cb, i)
    i++
  }
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
  if (!markdownText) {
    markdownText = ''
  }
  if (markdownText.startsWith('#! ')) {
    markdownText = markdownText.slice(markdownText.indexOf('\n'))
  }

  const matched = reFrontmatter.exec(markdownText)
  const settings = matched ? safeLoad(matched[1]) : {}
  if (matched) {
    markdownText = markdownText.slice(matched[0].length)
  }

  const vfile = parseMarkdown(markdownText)
  return { settings, vfile }
}

export interface CodeBlock {
  code: string
  filetype: string
  meta: { [props: string]: any }
  parent: any
  index: number
  hash: string
}

export const getCodeBlocks = async vfile => {
  const codeBlocks: CodeBlock[] = []
  await traversal(vfile, vfile, async (node, parent, index) => {
    if (node.type !== 'code') {
      return
    }

    const meta = parseMeta(node.meta)

    const filetype = node.lang
    if (meta.timeout) {
      meta.timeout = Number.parseInt(meta.timeout)
    }
    if (typeof meta.runMode === 'string') {
      meta.runMode = meta.runMode === 'true'
    }

    codeBlocks.push({
      code: node.value,
      filetype,
      meta,
      parent,
      index,
      hash: sha256(node.value)
    })
  })
  return codeBlocks
}
