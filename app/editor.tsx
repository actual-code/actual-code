import React, { useEffect, useMemo, useRef } from 'react'
import * as monaco from 'monaco-editor'

export default props => {
  const { setText, value, filename } = props
  const ref = useRef(null)
  const language = 'markdown'
  const style = { width: '100%', height: '100%' }
  const editor: monaco.editor.IStandaloneCodeEditor = useMemo(
    () => {
      if (!ref.current) {
        return null
      }
      const ed = monaco.editor.create(ref.current, {
        language,
        value,
        minimap: {
          enabled: false
        },
        wordWrap: 'on'
      })
      ed.onDidChangeModelContent(event => {
        setText(ed.getValue())
      })
      window.addEventListener('resize', () => ed.layout())
      return ed
      // dispose が必要
    },
    [!ref.current]
  )

  useEffect(
    () => {
      if (!editor || editor.getValue() === value) {
        return
      }
      editor.setValue(value)
    },
    [filename]
  )

  return <div ref={ref} style={style} />
}
