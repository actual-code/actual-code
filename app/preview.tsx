import React, { useEffect, useState, useRef } from 'react'

const { runMarkdown } = window as any

export default props => {
  const { value, isRunning: runMode } = props
  const [__html, setHtml] = useState('')
  const ref = useRef(null)
  useEffect(
    () => {
      runMarkdown(value, runMode).then(html => setHtml(html))
    },
    [value]
  )

  return <div dangerouslySetInnerHTML={{ __html }} />
}
