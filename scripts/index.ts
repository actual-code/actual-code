import * as globby from 'globby'
import * as mkdirp from 'mkdirp'
import * as rimraf from 'rimraf'

import { watchSrc } from './build/watch-src'
import { watchApp } from './build/watch-app'

const watch = async () => {
  const options = require('../tsconfig.json')
  const outDir = options.compilerOptions.outDir
  rimraf.sync(outDir)
  mkdirp.sync(outDir)
  watchSrc('src/**/*.ts')
  watchApp('app/index.html')
}

watch()
