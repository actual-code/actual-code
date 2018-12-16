import React, { useEffect, useMemo, useRef } from 'react'
import * as monaco from 'monaco-editor'

export default props => {
  const { setText, value } = props
  const ref = useRef(null)
  const language = 'markdown'
  const style = { width: '100%', height: '100%' }
  const editor: monaco.editor.IStandaloneCodeEditor = useMemo(
    () => {
      if (!ref.current) {
        return null
      }
      const ed = monaco.editor.create(ref.current, { language, value })
      ed.onDidChangeModelContent((event: any) => {
        setText(ed.getValue())
      })
      return ed
    },
    [!ref.current]
  )

  useEffect(
    () => {
      if (!editor || editor.getValue() === value) {
        return
      }
      editor && editor.setValue(value)
    },
    [value, !editor]
  )

  return <div ref={ref} style={style} />
}
