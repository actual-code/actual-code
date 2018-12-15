import React, { useEffect, useReducer, useRef } from 'react'

const { runMarkdown } = window as any

export default props => {
  const { value, isRunning: runMode } = props
  const ref = useRef(null)
  useEffect(
    () => {
      runMarkdown(value, runMode).then(html => (ref.current.innerHTML = html))
    },
    [value]
  )

  return <div ref={ref} />
}
