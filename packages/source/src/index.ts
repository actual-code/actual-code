import { safeLoad } from 'js-yaml'

export * from './markdown'
import { sha256 } from './utils'
import * as MDAST from './mdast'
import { parseMarkdown } from './markdown'

/**
 * Each code block of actual-code markdown
 */
export interface CodeBlock {
  /**
   * source code string of code block
   */
  code: string
  /**
   * language of code block.
   */
  lang: string
  /**
   * meta data of code block
   */
  meta: { [props: string]: any }
  /**
   * parent node
   */
  parent: MDAST.Parent
  /**
   * order in parent node
   */
  index: number
  /**
   * identifier of code block.
   */
  hash: string
}

const traversal = (
  node: MDAST.Node,
  parent: MDAST.Parent,
  cb: (node: MDAST.Node, parent: MDAST.Parent, index: number) => void,
  index = 0
) => {
  cb(node, parent, index)
  let i = 0
  const children = 'children' in node ? (node.children as MDAST.Content[]) : []
  for (const child of children) {
    traversal(child, node as MDAST.Parent, cb, i)
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

const reFrontmatter = /^---\n([^]*)\n---\n/

const getCodeBlocks = (root: MDAST.Root) => {
  const codeBlocks: CodeBlock[] = []
  traversal(root, root, (node, parent, index) => {
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
      lang: filetype,
      meta,
      parent,
      index,
      hash: sha256(node.value),
    })
  })
  return codeBlocks
}

export const parseActualCode = async (markdownText: string) => {
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

  const root = parseMarkdown(markdownText)
  const codeBlocks = getCodeBlocks(root)
  return { settings, root, codeBlocks }
}
