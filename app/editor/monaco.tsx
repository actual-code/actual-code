import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'

import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js'
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js'
;(window as any).MonacoEnvironment = {
  getWorker(moduleId, label) {
    if (label === 'json') {
      return new Worker(
        require.resolve('monaco-editor/esm/vs/language/json/json.worker.js')
      )
    }
    if (label === 'css') {
      return new Worker(
        require.resolve('monaco-editor/esm/vs/language/css/css.worker.js')
      )
    }
    if (label === 'html') {
      return new Worker(
        require.resolve('monaco-editor/esm/vs/language/html/html.worker.js')
      )
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(
        require.resolve('monaco-editor/esm/vs/language/typescript/ts.worker.js')
      )
    }
    return new Worker(
      require.resolve('monaco-editor/esm/vs/editor/editor.worker.js')
    )
  }
}

interface Props {
  onChange: (value: string) => void
  // onEvent: (event: string) => void
  value: string
}

export default (props: Props) => {
  const [height, setHeight] = useState(0)
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>(
    null
  )
  const [language, setLanguage] = useState('markdown')
  const { onChange, value } = props

  const divElement = useRef(null)

  const calcHeight = (e: monaco.editor.IStandaloneCodeEditor) => {
    const lines = e.getModel().getLineCount() + 1
    const lineHeight = e.getConfiguration().lineHeight
    const endPosition = e
      .getModel()
      .getFullModelRange()
      .getEndPosition()
    setHeight(
      e.getTopForPosition(endPosition.lineNumber, endPosition.column) +
        lineHeight * 2
    )
  }

  useEffect(() => {
    console.log('create monaco instance')
    const e: monaco.editor.IStandaloneCodeEditor = monaco.editor.create(
      divElement.current,
      {
        value,
        language,
        minimap: { enabled: false },
        scrollbar: { vertical: 'hidden', handleMouseWheel: false },
        wordWrap: 'on'
      }
    )
    e.focus()
    calcHeight(e)
    window.addEventListener('resize', () => e.layout())

    e.onDidChangeModelContent(ev => {
      onChange(e.getValue())
      calcHeight(e)
    })
    // e.onKeyDown(ev => {
    //   console.log(ev.code, e.getPosition().lineNumber, e.getModel().getLineCount())
    //   if (ev.code === 'ArrowDown' && e.getPosition().lineNumber === e.getModel().getLineCount()) {
    //     props.onEvent('next')
    //   } else if (ev.code === 'ArrowUp' && e.getPosition().lineNumber === 1) {
    //     props.onEvent('prev')
    //   }
    // })
    setEditor(e)

    return () => {
      e.dispose()
    }
  }, [])

  useEffect(
    () => {
      if (editor && value !== editor.getValue()) {
        editor.setValue(value || '')
        calcHeight(editor)
      }
    },
    [value, editor]
  )

  useEffect(
    () => {
      editor && editor.layout()
    },
    [height, editor]
  )

  // useMemo(() => {
  //   return monaco.languages.getLanguages().map(lang => lang.id)
  // }, [])
  // if (height === 0) {
  //   return <div ref={divElement} />
  // }

  return (
    <div
      style={{
        width: '100%',
        overflowY: 'visible',
        height: `${height}px`,
        border: '4px'
      }}
    >
      {/* <div>{lang}</div> */}
      <div
        ref={divElement}
        style={{ height: `${height}px`, overflowY: 'visible' }}
      />
    </div>
  )
}
