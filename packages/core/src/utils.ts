import { createHash } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import * as mkdirp from 'mkdirp'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const readDir = promisify(fs.readdir)
const stat = promisify(fs.stat)

export const sha256 = (data: string | Buffer) => {
  const hash = createHash('sha256')
  hash.write(data)
  return hash.digest().toString('hex')
}

export const readDirRecursive = async (dir: string): Promise<string[]> => {
  const entries = await readDir(dir)
  const res = await Promise.all(
    entries.map(async entry => {
      const name = path.join(dir, entry)
      const st = await stat(name)
      if (st.isDirectory()) {
        return readDirRecursive(name)
      } else {
        return name
      }
    })
  )

  return [].concat(...res)
}

export const copyRecursive = async (srcDir: string, destDir: string) => {
  const dirs = await readDir(srcDir)
  Promise.all(
    dirs.map(async name => {
      const src = path.join(srcDir, name)
      const dest = path.join(destDir, name)
      const st = await stat(src)
      if (st.isDirectory()) {
        mkdirp.sync(dest)
        await copyRecursive(src, dest)
      } else {
        // CopyFile can not be used on pkg /snapshot file system
        const buf = await readFile(src)
        await writeFile(dest, buf)
      }
    })
  )
}
