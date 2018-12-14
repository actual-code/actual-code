import React, { useEffect, useReducer, useRef } from 'react'
import * as monaco from 'monaco-editor'

export default props => {
  const { setText, value } = props
  let editor
  const ref = useRef(null)
  const language = 'markdown'
  const style = { width: '100%', height: '100%' }
  useEffect(() => {
    editor = monaco.editor.create(ref.current, { language, value })
    editor.onDidChangeModelContent((event: any) => {
      const value = editor.getValue()
      setText(value)
    })
  }, [])

  return <div ref={ref} style={style} />
}
