import * as os from 'os'
import * as path from 'path'

import * as mkdirp from 'mkdirp'

import { NodeJsStorage } from './nodejs'

export interface Metadata {
  id: string
  title: string
  tags: string[]
  at: Date
  results: any
  codeHash: string
}

export type AppState = Metadata & { code: string }

export interface Storage {
  readById: (id: string) => Promise<AppState>
  updateAppState: (id: string, code: string, results: any) => Promise<void>
  find: () => Promise<AppState[]>
}

export const createStorage = async (): Promise<Storage> => {
  const appDir = path.join(os.homedir(), 'actual-code')
  mkdirp.sync(appDir)
  return new NodeJsStorage(appDir)
}
