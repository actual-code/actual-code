import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

import * as chokidar from 'chokidar'

import { createSource, Source } from './source'
import { transpile } from './transpile'

interface Watch {
  filename: string
  source: Source
  dest: string
}

export const watchSrc = async (
  entries: string | string[],
  ignored: string | string[],
  cwd: string
) => {
  const watcher = chokidar.watch(entries, { ignored, cwd })
  const watches: { [name: string]: Watch } = {}
  watcher.on('add', async (key: string) => {
    const getRelative = (s: string) =>
      path.relative(process.cwd(), path.resolve(cwd, s))

    const filename = getRelative(key)
    const dest = filename.replace('/src/', '/dist/').replace(/\.tsx?$/, '.js')

    const watch: Watch = {
      filename,
      source: await createSource(path.join(cwd, key)),
      dest,
    }
    await watch.source.ready()
    await transpile(watch.source, watch.dest)
    watches[key] = watch
    console.log('compile', watch.filename, watch.dest)
  })
  watcher.on('change', async (key: string) => {
    const watch = watches[key]
    const code = await readFile(path.join(cwd, key), 'utf-8')
    await watch.source.update(code)
    await transpile(watch.source, watch.dest)
    console.log('update', watch.filename, watch.dest)
  })
  watcher.on('unlink', async (key: string) => {
    const watch = watches[key]
    await unlink(watch.dest)
    delete watches[key]
    console.log('unlink', watch.filename, watch.dest)
  })
}
