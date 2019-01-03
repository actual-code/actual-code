import * as os from 'os'
import * as path from 'path'

import * as mkdirp from 'mkdirp'

import { writeBlob, createIndex } from './blob'

export interface BlobHistory {
  hash: string
  updatedAt: Date
}

export interface AppState {
  code: string
  title: string
  tags: string[]
  codeHistory: BlobHistory[]
  createdAt: Date
  updatedAt: Date
}

export interface Storage {
  readAppState: (id: string) => Promise<AppState>
  updateAppState: (id: string, appState: Partial<AppState>) => Promise<void>
  find: () => Promise<AppState[]>
}

class NodeJsStorage implements Storage {
  private _appDir: string
  private _appStates: { [props: string]: AppState } = {}
  private _init: Promise<void>
  constructor(appDir: string) {
    this._appDir = appDir

    this._init = createIndex().then(appStates => {
      this._appStates = appStates
    })
  }

  async readAppState(id: string) {
    await this._init
    return this._appStates[id]
  }

  async updateAppState(id: string, appState: Partial<AppState>) {
    await this._init
    if ('code' in appState) {
      const code = `---\n  title: ${appState.title}\n  id: ${id}\n---\n${
        appState.code
      }`
      await writeBlob(code, '.md')
    }

    this._appStates[id] = {
      ...this._appStates[id],
      ...appState
    }
  }

  async find() {
    await this._init
    // wait updateAppState

    return Object.keys(this._appStates).map(id => {
      return {
        id,
        ...this._appStates[id]
      }
    })
  }
}

export const createStorage = async (): Promise<Storage> => {
  const appDir = path.join(os.homedir(), 'actual-code')
  mkdirp.sync(appDir)
  return new NodeJsStorage(appDir)
}
