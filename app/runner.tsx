import React, { useEffect, useState, useMemo } from 'react'

import Editor from './editor'

const { runMarkdown, initSandbox } = window as any

export default props => {
  const { filename, setFilename } = props
  const [text, setText] = useState('')
  const [__html, setHtml] = useState('')

  const _init = useMemo(
    () => {
      return initSandbox(filename).then(res => {
        setText(res.code || '')
        return res.code
      })
    },
    [filename]
  )

  useEffect(
    () => {
      _init.then(code => {
        runMarkdown(text || code, false).then(html => {
          setHtml(html)
        })
      })
    },
    [text, filename]
  )
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '2em 1fr',
        gridTemplateColumns: '50% 50%',
        gridAutoRows: 'auto',
        gridAutoColumns: 'auto',
        height: '100vh',
        width: 'calc(100% - 10px)'
      }}
    >
      <nav style={{ gridRow: '1', gridColumn: '1/3' }}>
        <button
          onClick={() => {
            runMarkdown(text, true).then(html => setHtml(html))
          }}
        >
          Run
        </button>
        <button onClick={() => setFilename(null)}>Close</button>
      </nav>

      <Editor
        setText={setText}
        filename={filename}
        value={text}
        style={{ gridRow: '2', gridColumn: '1' }}
      />
      <div
        dangerouslySetInnerHTML={{ __html }}
        style={{ gridRow: '2', gridColumn: '2', padding: '1em' }}
      />
    </div>
  )
}
