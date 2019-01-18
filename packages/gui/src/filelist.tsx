import React, { useEffect, useState } from 'react'

const uuidv4 = require('uuidv4')

const { getFileList } = window

export default props => {
  const { setFilename } = props
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    getFileList().then(list => setFileList(list))
  }, [])

  const formatDate = (at: Date) => {
    const pad = (n: number) => n.toString(10).padStart(2, '0')

    return `${pad(at.getFullYear())}/${pad(at.getMonth() + 1)}/${pad(
      at.getDate()
    )} ${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}`
  }

  const files = fileList.map(info => {
    const at = formatDate(new Date(info.at))
    return (
      <li key={info.id} onClick={() => setFilename(info.id)}>
        {info.title} at {at} {info.tags ? info.tags.join(', ') : ''}
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
