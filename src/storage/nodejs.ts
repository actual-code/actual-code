import { Storage, Metadata, AppState } from '.'
import { writeBlob, listBlobs, readBlob } from './blob'
import { parse, MDAST } from '../source'

export const readMeta = async (hash: string) => {
  const buf = await readBlob(hash)
  const metadata: Metadata = JSON.parse(buf.toString('utf-8'))
  metadata.at = new Date(metadata.at)
  return metadata
}

export class NodeJsStorage implements Storage {
  private _appDir: string
  private _index: { [props: string]: Metadata[] } = {}

  private _init: Promise<void>
  constructor(appDir: string) {
    this._appDir = appDir

    this._init = this._createIndex()
  }

  private async _updateIndex(metadata: Metadata) {
    if (!(metadata.id in this._index)) {
      this._index[metadata.id] = []
    }
    this._index[metadata.id].unshift(metadata)
  }

  private async _createIndex() {
    const hashes = Array.from(new Set(await listBlobs('.json')))
    const metadataAr = await Promise.all(
      hashes.map(async hash => readMeta(hash))
    )
    const sortByDateDesc = (a: Metadata, b: Metadata) =>
      a.at.valueOf() - b.at.valueOf()

    metadataAr.sort(sortByDateDesc).forEach(metadata => {
      this._updateIndex(metadata)
    })
  }

  async toAppState(metadata: Metadata): Promise<AppState> {
    const code = (await readBlob(metadata.codeHash)).toString('utf-8')
    return { ...metadata, code }
  }

  async readById(id: string) {
    await this._init
    if (id in this._index) {
      return this.toAppState(this._index[id][0])
    } else {
      return null
    }
  }

  async updateAppState(id: string, code: string, results: any) {
    await this._init

    const codeHash = await writeBlob(code, '.md')

    const { root } = await parse(code)
    const found = root.children.find(
      child => child.type === 'heading'
    ) as MDAST.Heading
    const title =
      found &&
      found.children &&
      found.children
        .map(child => child.value)
        .filter(s => s)
        .join(' ')

    const metadata: Metadata = {
      title,
      codeHash,
      tags: [],
      at: new Date(),
      id,
      results
    }
    await writeBlob(JSON.stringify(metadata), '.json')

    await this._updateIndex(metadata)
  }

  async find() {
    await this._init
    const appStates = await Promise.all(
      Object.keys(this._index).map(id => this.toAppState(this._index[id][0]))
    )
    // FIXME sort

    return appStates
  }
}
