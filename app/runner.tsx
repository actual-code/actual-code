import React, { useEffect, useMemo, useReducer } from 'react'

import Editor from './editor'
import { initActualCode } from './frontend'

export interface State {
  text: string
  __html: string
  results: { [hash: string]: string }
}

const initialState: State = {
  text: '',
  __html: '',
  results: {}
}

const actions: { [props: string]: (state: State, action) => State } = {
  SET_TEXT: (state, action) => {
    const { text } = action
    return { ...state, text }
  },
  SET_HTML: (state, action) => {
    const { __html } = action
    return { ...state, __html }
  },
  SET_RESULT: (state, action) => {
    const { hash, data } = action
    const results = { ...state.results, [hash]: data }
    return { ...state, results }
  }
}

const reducer = (state: State, action) => {
  if (action.type in actions) {
    return actions[action.type](state, action)
  } else {
    return state
  }
}

export default props => {
  const { filename, setFilename } = props
  const [state, dispatch] = useReducer(reducer, initialState)
  const { text, __html, results } = state

  const run = async (actualCode: ActualCode, runMode: boolean) => {
    let __html = await actualCode.run(text, { runMode })
    dispatch({ type: 'SET_HTML', __html })
    __html = await actualCode.waitFinished()
    dispatch({ type: 'SET_HTML', __html })
  }

  // useEffect(() => {
  //   const outputString = (hash: string, data: string | Buffer) => {
  //     const q = document.querySelector(`code.language-${hash}`)
  //     if (!q) {
  //       return
  //     }
  //     const result = data.toString() || results[hash] || q.textContent
  //     dispatch({ type: 'SET_RESULT', data: result, hash })
  //     q.textContent = result
  //   }

  //   // reporter を plugin に書き換える
  // }, [])

  const _init = useMemo(
    async () => {
      const actualCode = await initActualCode(filename)
      const appState = await actualCode.getAppState()
      const code = appState ? appState.code : ''
      dispatch({ type: 'SET_TEXT', text: code })
      return actualCode
    },
    [filename]
  )

  useEffect(
    () => {
      _init.then(async actualCode => run(actualCode, false))
    },
    [text, filename]
  )
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
      <nav style={{ gridRow: '1', gridColumn: '1/3' }}>
        <button
          onClick={() => {
            _init.then(actualCode => run(actualCode, true))
          }}
        >
          Run
        </button>
        <button
          onClick={async () => {
            const actualCode = await _init
            await actualCode.save(text)
            setFilename(null)
          }}
        >
          Close
        </button>
      </nav>

      <Editor
        setText={(text: string) => dispatch({ type: 'SET_TEXT', text })}
        filename={filename}
        value={text}
        style={{ gridRow: '2', gridColumn: '1' }}
      />
      <div
        dangerouslySetInnerHTML={{ __html }}
        className="markdown-body"
        style={{ gridRow: '2', gridColumn: '2', padding: '1em' }}
      />
    </div>
  )
}
