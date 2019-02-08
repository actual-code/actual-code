import { createElement, ReactElement, Fragment } from 'react'

import { MDAST } from '.'

const c = (tag: any, tree: MDAST.Parent, props = {}) => {
  return createElement(
    tag,
    props,
    ...tree.children.map(child => compiler(child)).filter(child => child)
  )
}

const root = (tree: MDAST.Root) => c(Fragment, tree)

const heading = (tree: MDAST.Heading) => c(`h${tree.depth}`, tree)

const thematicBreak = () => createElement('hr')

const blockquote = (tree: MDAST.Blockquote) => c('blockquote', tree)

const text = (tree: MDAST.Text) => tree.value

const paragraph = (tree: MDAST.Paragraph) => c('p', tree)

const inlineCode = (tree: MDAST.InlineCode) =>
  createElement('code', {}, tree.value)

const breakNode = () => '\n'

const code = (tree: MDAST.Code) => createElement('pre', tree.value)

const link = (tree: MDAST.Link) => c('a', tree, { href: tree.url })

const list = (tree: MDAST.List) => c('ul', tree)

const listItem = (tree: MDAST.ListItem) => c('li', tree)

const table = (tree: MDAST.Table) => c('table', tree)
const tableRow = (tree: MDAST.TableRow) => c('tr', tree)
const tableCell = (tree: MDAST.TableCell) => c('td', tree)

// html

const yaml = () => null

const emphasis = (tree: MDAST.Emphasis) => c('em', tree)
const strong = (tree: MDAST.Strong) => c('strong', tree)
const _delete = (tree: MDAST.Delete) => c('s', tree)

const compilers: {
  [props: string]: (tree: MDAST.Node) => ReactElement<any> | string
} = {
  root,
  heading,
  thematicBreak,
  blockquote,
  text,
  paragraph,
  inlineCode,
  breakNode,
  code,
  link,
  list,
  listItem,
  table,
  tableRow,
  tableCell,
  yaml,
  emphasis,
  strong,
  delete: _delete,
}

export const compiler = (tree: MDAST.Node) => {
  if (!(tree.type in compilers)) {
    console.log(tree)
  }
  return compilers[tree.type](tree)
}

export default function mdToReact() {
  this.Compiler = (tree: MDAST.Root) => {
    return compiler(tree)
  }
}
