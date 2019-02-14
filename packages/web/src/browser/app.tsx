import React, { useEffect, useState } from 'react'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
html {
  font-family: sans-serif;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

body {
  line-height: 1.4;
  letter-spacing: 0;
  background-color: #fcfcfc;
  color: #111;

  font-weight: 400;
  font-style: normal;
  text-rendering: optimizeLegibility;
  /* -webkit-font-smoothing: antialiased; */
}

article {
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap:break-word;
}

article pre {
  max-width: 700px;
  overflow-x: auto;
  margin-top: 30px;
  color: hsl(0, 0%, 90%);
  background-color: hsl(120, 80%, 13%);
  padding: 20px;
  white-space: pre-wrap;
  line-height: 1.5;
}

article h1,h2,h3,h4,h5,h6 {
  margin-top: 0;
  margin-bottom: 0;
}

article h1 {
  font-size: 32px;
  font-weight: 600;
}

article h2 {
  font-size: 24px;
  font-weight: 600;
}

article h3 {
  font-size: 20px;
  font-weight: 600;
}

article h4 {
  font-size: 16px;
  font-weight: 600;
}

article h5 {
  font-size: 14px;
  font-weight: 600;
}

article h6 {
  font-size: 12px;
  font-weight: 600;
}

article p {
  font-size: 18px;
  line-height: 1.8;
  letter-spacing: -.004em;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

article blockquote {
  margin: 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

article ul,
article ol {
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 0;
}

article ol ol,
article ul ol {
  list-style-type: lower-roman;
}

article ul ul ol,
article ul ol ol,
article ol ul ol,
article ol ol ol {
  list-style-type: lower-alpha;
}

article dd {
  margin-left: 0;
}

article hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

article ul,
article ol {
  padding-left: 2em;
}

article ul ul,
article ul ol,
article ol ol,
article ol ul {
  margin-top: 0;
  margin-bottom: 0;
}

article li {
  word-wrap: break-all;
}

article li > p {
  margin-top: 16px;
}

article li + li {
  margin-top: 0.25em;
}

article dl {
  padding: 0;
}

article dl dt {
  padding: 0;
  margin-top: 16px;
  font-size: 1em;
  font-style: italic;
  font-weight: 600;
}

article dl dd {
  padding: 0 16px;
  margin-bottom: 16px;
}

article iframe {
  border: 2px hsl(120, 80%, 13%) dashed;
  max-width: 700px;
  min-width: 400px;
  max-height: 700px;

}
`

import { Results } from '@actual-code/core'
import {
  mdastToReact,
  MDAST,
  CodeBlock,
  insertAfter,
} from '@actual-code/source'

const fetchArticleData = async () => {
  const res = await fetch('./index.json')
  return res.json()
}

const insertResults = (
  root: MDAST.Root,
  codeBlocks: CodeBlock[],
  results: Results
) => {
  codeBlocks
    .filter(codeBlock => codeBlock.hash in results)
    .reverse()
    .forEach(codeBlock => {
      results[codeBlock.hash]
        .filter(result => result.subType === 'browser')
        .forEach(result => {
          const node: MDAST.HTML = {
            type: 'html',
            value: `<iframe src="/frame/${result.payload.filename}"></iframe>`,
          }
          insertAfter(root, codeBlock.pointers, node)
        })
      let value = ''
      let type = ''
      results[codeBlock.hash]
        .filter(result => result.subType !== 'browser')
        .forEach(result => {
          if (result.subType === 'stdout' || result.subType === 'stderr') {
            if (result.subType !== type) {
              type = result.subType
              value += `---${type}\n`
            }
            value += result.payload.toString()
          }
        })
      const node: MDAST.Code = {
        type: 'code',
        value,
      }
      insertAfter(root, codeBlock.pointers, node)
    })
}

export default () => {
  const [article, setArticle] = useState(<div>now loading...</div>)
  useEffect(() => {
    fetchArticleData().then(({ root, codeBlocks, results }) => {
      insertResults(root, codeBlocks, results)
      setArticle(mdastToReact(root))
    })
  }, [])
  return (
    <>
      <GlobalStyle />
      <article>{article}</article>
    </>
  )
}
