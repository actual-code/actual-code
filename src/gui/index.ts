import * as path from 'path'

import * as carlo from 'carlo'
import Bundler from 'parcel-bundler'

export const gui = async cb => {
  const outDir = path.join(__dirname, '..', 'dist', 'app')
  const entryFile = path.join(__dirname, '..', '..', 'app', 'index.html')
  const opts = {
    outDir,
    outFile: 'index.html',
    sourceMaps: true,
    hmr: false
  }

  const bundler = new Bundler(entryFile, opts)
  await bundler.bundle()
  const cApp = await carlo.launch()
  cApp.serveFolder(outDir)
  await cb(cApp)
  await cApp.load('index.html')
}
