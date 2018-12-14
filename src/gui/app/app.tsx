import React, { useState } from 'react'

import Editor from './editor'
import Preview from './preview'

export default props => {
  const [text, setText] = useState('')
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        height: '100vh'
      }}
    >
      <Editor setText={setText} value={text} />
      <Preview value={text} />
    </div>
  )
}
