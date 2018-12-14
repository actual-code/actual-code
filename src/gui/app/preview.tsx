import React, { useEffect, useReducer, useRef } from 'react'

const { runMarkdown } = window as any

export default props => {
  const { value } = props
  const ref = useRef(null)
  useEffect(
    () => {
      runMarkdown(value).then(html => (ref.current.innerHTML = html))
    },
    [value]
  )

  return <div ref={ref} />
  // return <div dangerouslySetInnerHTML={{ __html: value}} />
}
