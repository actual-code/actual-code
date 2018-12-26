import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'

import * as mkdirp from 'mkdirp'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const appDir = path.join(os.homedir(), 'actual-code')
mkdirp.sync(appDir)
const stateFile = path.join(appDir, 'state.json')

export const readState = async () => {
  try {
    const stateJson = await readFile(stateFile, { encoding: 'utf-8' })
    return JSON.parse(stateJson)
  } catch (e) {
    return {}
  }
}

export const writeState = async state => {
  await writeFile(stateFile, JSON.stringify(state, null, '  '))
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
