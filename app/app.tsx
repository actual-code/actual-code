import React, { useEffect, useState } from 'react'

import Editor from './editor'

const { runMarkdown, initSandbox, getFileList } = window as any

export default props => {
  const [filename, setFilename] = useState(null)
  const [text, setText] = useState('')
  const [__html, setHtml] = useState('')
  const [fileList, setFileList] = useState([])

  const [newFilename, setNewFilename] = useState('')

  useEffect(
    () => {
      if (!filename) {
        getFileList().then(list => setFileList(list))
      } else {
        initSandbox(filename).then(md => setText(md || ''))
      }
    },
    [filename]
  )

  useEffect(
    () => {
      if (!filename) {
        return
      }
      runMarkdown(text, false).then(html => setHtml(html))
    },
    [text, filename]
  )

  let nav
  let content
  if (filename) {
    nav = (
      <>
        <span>{filename}</span>
        <button
          onClick={() => {
            runMarkdown(text, true).then(html => setHtml(html))
          }}
        >
          Run
        </button>
        <button onClick={() => setFilename(null)}>Close</button>
      </>
    )
    content = (
      <>
        <Editor
          setText={setText}
          value={text}
          style={{ gridRow: '2', gridColumn: '1' }}
        />
        <div
          dangerouslySetInnerHTML={{ __html }}
          style={{ gridRow: '2', gridColumn: '2' }}
        />
      </>
    )
  } else {
    nav = (
      <>
        <input
          type="text"
          onChange={ev => setNewFilename(ev.target.value)}
          value={newFilename}
        />
        <button
          onClick={() => {
            if (newFilename !== '') {
              setFilename(newFilename)
            }
          }}
        >
          NEW
        </button>
      </>
    )
    const files = fileList.map(name => (
      <li key={name} onClick={() => setFilename(name)}>
        {name}
      </li>
    ))
    content = (
      <div style={{ gridRow: '2', gridColumn: '1 / 3' }}>
        <ul>{files}</ul>
      </div>
    )
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '2em 1fr',
        gridTemplateColumns: '1fr 1fr',
        height: '100vh'
      }}
    >
      <div style={{ gridRow: '1', gridColumn: '1/3' }}>{nav}</div>
      {content}
    </div>
  )
}
