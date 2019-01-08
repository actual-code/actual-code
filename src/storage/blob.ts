import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'

import * as mkdirp from 'mkdirp'
import writeFileAtomic from 'write-file-atomic'

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

import { sha256 } from '../utils'

const appDir = path.join(os.homedir(), '.actual-code')
const blobDir = path.join(appDir, 'blob')
mkdirp.sync(blobDir)

export const writeBlob = async (data: string | Buffer, ext: string) => {
  const hash = sha256(data)
  const encoding = typeof data === 'string' ? 'utf-8' : undefined
  return new Promise<string>((resolve, reject) => {
    writeFileAtomic.sync(path.join(blobDir, `${hash}${ext}`), data, {
      encoding
    })
    resolve(hash)
  })
}

export const listBlobs = async (ext: string) => {
  const files = await readDir(blobDir)
  return files
    .filter(filename => filename.endsWith(ext))
    .map(filename => filename.replace(/\.[a-zA-Z0-9]+$/, ''))
}

export const readBlob = async (hash: string) => {
  const paths = await readDir(blobDir)
  const filename = path.join(blobDir, paths.find(p => p.startsWith(hash)))
  const buf = await readFile(filename)
  if (sha256(buf) !== hash) {
    // FIXME
    // unlink
    // report error
    return
  }
  return buf
}
