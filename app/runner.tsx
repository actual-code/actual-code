import React, { useEffect, useMemo, useReducer } from 'react'

import Editor from './editor'
import { initActualCode, setReportCallback, stringifyHtml } from './frontend'

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

  const run = async (actualCode, runMode: boolean) => {
    const { code } = await actualCode.getAppState()
    const { node, codeBlocks } = await actualCode.run(text || code, {
      runMode
    })
    const nodes: { [hash: string]: any } = {}

    const search = (vfile, n) => {
      if (JSON.stringify(vfile.position) === JSON.stringify(n.position)) {
        return vfile
      }

      for (const child of vfile.children) {
        if ('children' in child) {
          return search(child, n)
        }
      }
      return null
    }

    codeBlocks.reverse().forEach(({ parent, index, hash, meta }) => {
      if (runMode || meta.runMode === 'true') {
        dispatch({ type: 'SET_RESULT', data: '', hash })
      }
      nodes[hash] = {
        type: 'code',
        value: results[hash] || '',
        lang: hash
      }
      parent = search(node, parent)
      parent.children = [
        ...parent.children.slice(0, index + 1),
        nodes[hash],
        ...parent.children.slice(index + 1)
      ]
    })

    const __html = await stringifyHtml(node)
    dispatch({ type: 'SET_HTML', __html })
  }

  useEffect(() => {
    setReportCallback((type, hash, data) => {
      const outputString = (hash: string, data: string | Buffer) => {
        const q = document.querySelector(`code.language-${hash}`)
        if (!q) {
          return
        }
        const result = (results[hash] || q.textContent) + data.toString()
        dispatch({ type: 'SET_RESULT', data: result, hash })
        q.textContent = result
      }
      const outputTypes = {
        stderr: outputString,
        stdout: outputString
      }
      if (type in outputTypes) {
        outputTypes[type](hash, data)
      }
    })
  }, [])

  const _init = useMemo(
    async () => {
      const actualCode = await initActualCode(filename)
      const appState = await actualCode.getAppState()
      const { code } = appState
      dispatch({ type: 'SET_TEXT', text: code || '' })
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
            _init.then(async actualCode => run(actualCode, true))
          }}
        >
          Run
        </button>
        <button onClick={() => setFilename(null)}>Close</button>
      </nav>

      <Editor
        setText={(text: string) => dispatch({ type: 'SET_TEXT', text })}
        filename={filename}
        value={text}
        run={run}
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
