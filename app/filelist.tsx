import React, { useEffect, useState } from 'react'

const uuidv4 = require('uuidv4')

import { getFileList } from './frontend'

export default props => {
  const { setFilename } = props
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    getFileList().then(list => setFileList(list))
  }, [])

  const files = fileList.map(info => {
    return (
      <li key={info.name} onClick={() => setFilename(info.name)}>
        {info.title} at {new Date(info.updatedAt).toLocaleString()}{' '}
        {info.tags ? info.tags.join(', ') : ''}
      </li>
    )
  })
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
      <div style={{ gridRow: '1', gridColumn: '1/3' }}>
        <button
          onClick={() => {
            setFilename(uuidv4())
          }}
        >
          NEW
        </button>
      </div>

      <div style={{ gridRow: '2', gridColumn: '1 / 3' }}>
        <ul>{files}</ul>
      </div>
    </div>
  )
}
