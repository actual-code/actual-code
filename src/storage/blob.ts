import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'

import * as mkdirp from 'mkdirp'
import writeFileAtomic from 'write-file-atomic'
import { safeLoad } from 'js-yaml'

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

import { sha256 } from '../utils'
import { AppState } from '.'

const appDir = path.join(os.homedir(), 'actual-code')
const blobDir = path.join(appDir, 'blob')
mkdirp.sync(blobDir)

export const writeBlob = async (data: string | Buffer, ext = '.blob') => {
  const hash = sha256(data)
  const encoding = typeof data === 'string' ? 'utf-8' : undefined
  return new Promise<string>((resolve, reject) => {
    writeFileAtomic.sync(path.join(blobDir, `${hash}${ext}`), data, {
      encoding
    })
    resolve(hash)
  })
}

export const listBlobs = async () => {
  const files = await readDir(blobDir)
  return files.map(filename => filename.replace(/\.[a-zA-Z0-9]+$/, ''))
}

export const readBlob = async (hash: string) => {
  const paths = await readDir(blobDir)
  const filename = path.join(blobDir, paths.find(p => p.startsWith(hash)))
  const buf = await readFile(filename)
  return { buf, stat: await stat(filename) }
}

const reFrontmatter = /^---\n([^]*)\n---\n/

export const createIndex = async () => {
  const appStates: { [props: string]: AppState } = {}
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
    if (!(id in appStates)) {
      appStates[id] = {
        codeHistory: [],
        createdAt: new Date(999999999999999),
        updatedAt: new Date(0),
        code: '',
        title: '',
        tags: []
      }
    }
    if (
      !appStates[id].codeHistory.find(
        tm => tm.updatedAt.valueOf() > stat.mtime.valueOf()
      )
    ) {
      appStates[id].code = data.slice(matched[0].length)
      appStates[id].title = title
      appStates[id].tags = tags
      appStates[id].updatedAt = stat.mtime
    }

    if (appStates[id].createdAt.valueOf() > stat.ctime.valueOf()) {
      appStates[id].createdAt = stat.ctime
    }
    appStates[id].codeHistory.push({
      hash,
      updatedAt: stat.mtime
    })
  }
  return appStates
}
