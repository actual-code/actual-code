import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

import * as mkdirp from 'mkdirp'
import * as chokidar from 'chokidar'

import { createSource, Source } from './source'

interface Watch {
  filename: string
  source: Source
  dest: string
}

const transpile = async (source: Source) => {
  await source.ready()
  const res = await source.babel.transformFromAstAsync(
    source.ast,
    source.code,
    {
      ast: true,
      filename: source.filename,
      presets: [
        require('@babel/preset-typescript'),
        [require('@babel/preset-env'), { targets: { node: '10' } }]
      ],
      plugins: [
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-object-rest-spread')
      ]
    }
  )
  await source.updateAst(res.ast)
}

export const watchSrc = async (entry: string) => {
  const watcher = chokidar.watch(entry, { ignored: /\.{test|d}\.ts$/ })
  const watches: { [name: string]: Watch } = {}
  watcher.on('add', async (filename: string) => {
    const watch: Watch = {
      filename,
      source: await createSource(filename),
      dest: filename.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js')
    }
    await watch.source.ready()
    await transpile(watch.source)
    mkdirp.sync(path.dirname(watch.dest))
    await writeFile(watch.dest, watch.source.code)
    watches[filename] = watch
    console.log('compile', filename, watch.dest)
  })
  watcher.on('change', async (filename: string) => {
    const code = await readFile(filename, 'utf-8')
    const watch = watches[filename]
    await watch.source.update(code)
    await transpile(watch.source)
    await writeFile(watch.dest, watch.source.code)
    console.log('update', filename, watch.dest)
  })
  watcher.on('unlink', async (filename: string) => {
    const watch = watches[filename]
    await unlink(watch.dest)
    delete watches[filename]
    console.log('unlink', filename, watch.dest)
  })
}
