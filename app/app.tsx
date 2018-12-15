import React, { useEffect, useState } from 'react'

import Editor from './editor'
import Preview from './preview'

const { runMarkdown } = window as any

export default props => {
  const [text, setText] = useState('')
  const [__html, setHtml] = useState('')
  useEffect(
    () => {
      runMarkdown(text, false).then(html => setHtml(html))
    },
    [text]
  )
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '2em 1fr',
        gridTemplateColumns: '1fr 1fr',
        height: '100vh'
      }}
    >
      <div style={{ gridRow: '1', gridColumn: '1/3' }}>
        <button
          onClick={() => {
            runMarkdown(text, true).then(html => setHtml(html))
          }}
        >
          Run
        </button>
      </div>
      <Editor
        setText={setText}
        value={text}
        style={{ gridRow: '2', gridColumn: '1' }}
      />
      <div
        dangerouslySetInnerHTML={{ __html }}
        style={{ gridRow: '2', gridColumn: '2' }}
      />
    </div>
  )
}
