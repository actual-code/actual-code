import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'

import * as mkdirp from 'mkdirp'

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

export interface AppState {
  path: string
  code: string
  title: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export const setup = async (filename: string): Promise<AppState> => {
  const state = await readState()
  state.paths = state.paths || {}
  const appState: AppState = state.paths[filename] || {}

  appState.code = appState.code || ''
  appState.title = appState.title || ''
  appState.tags = appState.tags || []
  appState.createdAt = appState.createdAt || Date.now()
  if (!('path' in appState) || !fs.existsSync(appState.path)) {
    appState.path = await mkdtemp(path.join(os.tmpdir(), 'actual-'))
    updateState(filename, appState)
  }
  process.chdir(appState.path)
  return appState
}

export const getFileList = async () => {
  const state = await readState()
  return Object.keys(state.paths || {})
    .map(name => ({
      ...state.paths[name],
      name
    }))
    .filter(appState => 'code' in appState)
}

export const updateState = async (filename: string, appState: AppState) => {
  const state = await readState()
  state.paths = state.paths || {}
  appState.updatedAt = Date.now()
  state.paths[filename] = appState
  await writeState(state)
}
