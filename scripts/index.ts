import * as mkdirp from 'mkdirp'
import * as rimraf from 'rimraf'

import { watchSrc } from './build/watch-src'
import { buildSrc } from './build/build-src'
import { bundleApp } from './build/bundle-app'
import { buildPkg } from './build/build-pkg'

const watch = async () => {
  process.env.NODE_ENV = 'development'
  const options = require('../tsconfig.json')
  const outDir = options.compilerOptions.outDir
  rimraf.sync(outDir)
  mkdirp.sync(outDir)
  watchSrc('src/**/*.ts')
  bundleApp('app/index.html', true)
}

const build = async () => {
  process.env.NODE_ENV = 'production'
  const options = require('../tsconfig.json')
  const outDir = options.compilerOptions.outDir
  rimraf.sync(outDir)
  mkdirp.sync(outDir)
  await buildSrc('src/**/*.ts')
  await bundleApp('app/index.html', false)
  await buildPkg()
}

const subcommands = { watch, build }

if (process.argv.length < 3 || !(process.argv[2] in subcommands)) {
  process.exit(1)
}

subcommands[process.argv[2]]()
