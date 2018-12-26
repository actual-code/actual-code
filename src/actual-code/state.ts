import { readState, writeState } from '../storage'

export interface AppState {
  path: string
  code: string
  title: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export const readAppState = async (filename: string): Promise<AppState> => {
  const state = await readState()
  state.paths = state.paths || {}
  const appState: AppState = state.paths[filename] || {}

  appState.code = appState.code || ''
  appState.title = appState.title || ''
  appState.tags = appState.tags || []
  appState.createdAt = appState.createdAt || Date.now()
  //  updateAppState(filename, appState)
  return appState
}

export const updateAppState = async (filename: string, appState: AppState) => {
  const state = await readState()
  state.paths = state.paths || {}
  appState.updatedAt = Date.now()
  state.paths[filename] = appState
  await writeState(state)
}
