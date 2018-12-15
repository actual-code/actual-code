import React, { useState } from 'react'

import Editor from './editor'
import Preview from './preview'

export default props => {
  const [text, setText] = useState('')
  const [runMode, setRunMode] = useState(true)
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
        <button onClick={() => setRunMode(!runMode)}>
          {runMode ? 'stop' : 'start'}
        </button>
      </div>
      <Editor
        setText={setText}
        value={text}
        style={{ gridRow: '2', gridColumn: '1' }}
      />
      <Preview
        value={text}
        isRunning={runMode}
        style={{ gridRow: '2', gridColumn: '2' }}
      />
    </div>
  )
}
