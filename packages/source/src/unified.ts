import unified from 'unified'

import parse from 'remark-parse'
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import html from 'remark-html'
import frontmatter from 'remark-frontmatter'
import stringify from 'remark-stringify'

import * as MDAST from './mdast'

const markdown = unified()
  .use(parse)
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(frontmatter, ['yaml'])
  .use(stringify)

export const parseMarkdown = vfile => {
  return markdown.parse(vfile) as MDAST.Root
}

export const stringifyHtml = (node: MDAST.Node, vfile?) =>
  unified()
    .use(html)
    .stringify(node, vfile)

export const stringifyMarkdown = (node: MDAST.Node, vfile?) =>
  markdown.stringify(node, vfile)
