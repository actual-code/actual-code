import remark from 'remark'
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import html from 'remark-html'
import frontmatter from 'remark-frontmatter'

import unified from 'unified'
import stringify from 'remark-stringify'

const markdown = remark()
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(html)
  .use(frontmatter, ['yaml'])

export const parseMarkdown = (...args) => markdown.parse(...args)
export const stringifyHtml = (...args) => markdown.stringify(...args)
export const stringifyMarkdown = (node, file?) =>
  unified()
    .use(stringify)
    .stringify(node, file)
