import * as os from 'os'
import * as path from 'path'

import * as mkdirp from 'mkdirp'
import { safeLoad } from 'js-yaml'

import { readBlob, writeBlob, listBlobs } from './blob'
import { sha256 } from '../utils'

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

const reFrontmatter = /^---\n([^]*)\n---\n/

class NodeJsStorage implements Storage {
  private _appDir: string
  private _appStates: { [props: string]: AppState } = {}
  private _init
  constructor(appDir: string) {
    this._appDir = appDir
    const createIndex = async () => {
      const hashes = Array.from(new Set(await listBlobs()))
      for (const hash of hashes) {
        const { buf, stat } = await readBlob(hash)
        if (sha256(buf) !== hash) {
          // FIXME
          // unlink
          // report error
          return
        }

        const data = buf.toString('utf-8')
        const matched = reFrontmatter.exec(data)
        const metadata = safeLoad(matched[1])
        const { id, title, tags } = metadata
        if (!(id in this._appStates)) {
          this._appStates[id] = {
            codeHistory: [],
            createdAt: new Date(999999999999999),
            updatedAt: new Date(0),
            code: '',
            title: '',
            tags: []
          }
        }
        if (
          !this._appStates[id].codeHistory.find(
            tm => tm.updatedAt.valueOf() > stat.mtime.valueOf()
          )
        ) {
          this._appStates[id].code = data.slice(matched[0].length)
          this._appStates[id].title = title
          this._appStates[id].tags = tags
          this._appStates[id].updatedAt = stat.mtime
        }

        if (this._appStates[id].createdAt.valueOf() > stat.ctime.valueOf()) {
          this._appStates[id].createdAt = stat.ctime
        }
        this._appStates[id].codeHistory.push({
          hash,
          updatedAt: stat.mtime
        })
      }
    }
    this._init = createIndex()
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
