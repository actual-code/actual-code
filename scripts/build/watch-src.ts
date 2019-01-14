import * as fs from 'fs'
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

export const watchSrc = async (entry: string) => {
  const watcher = chokidar.watch(entry, { ignored: /\.(test|d)\.ts$/ })
  const watches: { [name: string]: Watch } = {}
  watcher.on('add', async (filename: string) => {
    const watch: Watch = {
      filename,
      source: await createSource(filename),
      dest: filename.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js')
    }
    await watch.source.ready()
    await transpile(watch.source, watch.dest)
    watches[filename] = watch
    console.log('compile', filename, watch.dest)
  })
  watcher.on('change', async (filename: string) => {
    const code = await readFile(filename, 'utf-8')
    const watch = watches[filename]
    await watch.source.update(code)
    await transpile(watch.source, watch.dest)
    console.log('update', filename, watch.dest)
  })
  watcher.on('unlink', async (filename: string) => {
    const watch = watches[filename]
    await unlink(watch.dest)
    delete watches[filename]
    console.log('unlink', filename, watch.dest)
  })
}
