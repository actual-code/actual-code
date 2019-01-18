import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import writeFileAtomic from 'write-file-atomic'

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

import { sha256 } from '../utils'

const getBlobDir = (appDir: string) => path.join(appDir, 'blob')

/**
 * write blob
 * @param appDir - application directory.
 * @param data - write content
 * @param ext - extension
 * @return content hash
 */
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

/**
 * list blobs that match the extension
 * @param appDir - application directory.
 * @param ext - extension
 * @returns array of hash string
 */
export const listBlobs = async (appDir: string, ext: string) => {
  const blobDir = getBlobDir(appDir)
  const files = await readDir(blobDir)
  return files
    .filter(filename => filename.endsWith(ext))
    .map(filename => filename.replace(/\.[a-zA-Z0-9]+$/, ''))
}

/**
 * read blob by hash
 * @param appDir - application directory.
 * @param hash - read target hash
 * @returns content
 */
export const readBlob = async (appDir: string, hash: string) => {
  const blobDir = getBlobDir(appDir)
  const paths = await readDir(blobDir)
  const filename = paths.find(p => p.startsWith(hash))
  if (!filename) {
    throw new Error('FILE NOT FOUND')
  }
  const buf = await readFile(path.join(appDir, 'blob', filename))
  if (sha256(buf) !== hash) {
    throw new Error('HASH IS INVALID')
  }
  return buf
}
