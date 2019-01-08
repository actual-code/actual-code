import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import writeFileAtomic from 'write-file-atomic'

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

import { sha256 } from '../utils'

const getBlobDir = (appDir: string) => path.join(appDir, 'blob')

export const writeBlob = async (
  appDir: string,
  data: string | Buffer,
  ext: string
) => {
  const hash = sha256(data)
  const blobDir = getBlobDir(appDir)
  const encoding = typeof data === 'string' ? 'utf-8' : undefined
  return new Promise<string>((resolve, reject) => {
    writeFileAtomic.sync(path.join(blobDir, `${hash}${ext}`), data, {
      encoding
    })
    resolve(hash)
  })
}

export const listBlobs = async (appDir: string, ext: string) => {
  const blobDir = getBlobDir(appDir)
  const files = await readDir(blobDir)
  return files
    .filter(filename => filename.endsWith(ext))
    .map(filename => filename.replace(/\.[a-zA-Z0-9]+$/, ''))
}

export const readBlob = async (appDir: string, hash: string) => {
  const blobDir = getBlobDir(appDir)
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
