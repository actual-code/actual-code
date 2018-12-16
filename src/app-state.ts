import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'

import * as mkdirp from 'mkdirp'
import * as rimraf from 'rimraf'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdtemp = promisify(fs.mkdtemp)

const appDir = path.join(os.homedir(), 'actual-code')
mkdirp.sync(appDir)
const stateFile = path.join(appDir, 'state.json')

const readState = async () => {
  try {
    const stateJson = await readFile(stateFile, { encoding: 'utf-8' })
    return JSON.parse(stateJson)
  } catch (e) {
    return {}
  }
}

const writeState = async state => {
  await writeFile(stateFile, JSON.stringify(state, null, '  '))
}

export const setup = async (filename: string) => {
  const state = await readState()
  state.paths = state.paths || {}
  const appState = state.paths[filename] || {}

  // FIXME: べき等性…
  if (!('path' in appState) || !fs.existsSync(appState.path)) {
    appState.path = await mkdtemp(path.join(os.tmpdir(), 'actual-'))
    state.paths[filename] = appState
    writeState(state)
  }
  process.chdir(appState.path)
  return appState
}

export const getFileList = async () => {
  const state = await readState()
  return Object.keys(state.paths || {})
}

export const updateState = async (filename: string, appState) => {
  const state = await readState()
  state.paths = state.paths || {}
  state.paths[filename] = appState
  await writeState(state)
}
