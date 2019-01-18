import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import * as mkdirp from 'mkdirp'
import * as rimraf from 'rimraf'

import { watchSrc } from './watch-src'
import { buildSrc } from './build-src'
import { bundleApp } from './bundle-app'
import { buildPkg } from './build-pkg'

const readDir = promisify(fs.readdir)

export interface BuilderOptions {
  nodeEnv: 'development' | 'production'
  basePath: string
  sourceMatch: string | string[]
  entrypoints: string[]
  ignored: string[]
}

export const createBuiler = (opts: Partial<BuilderOptions>) => {
  const baseOpts = opts
  const projects: Array<BuilderOptions & { name: string }> = []

  const addProject = (name: string, proj: Partial<BuilderOptions> = {}) => {
    const defaultOption: BuilderOptions = {
      basePath: path.resolve('packages', name),
      nodeEnv: 'development',
      sourceMatch: ['src/**/*.(j|t)s', 'src/**/*.(j|t)sx'],
      ignored: ['.d.ts', '.test.(j|t)s'],
      entrypoints: [],
    }
    projects.push({ ...defaultOption, ...baseOpts, ...proj, name })
  }

  const build = async () => {}
  const watch = async () => {
    Promise.all(
      projects.map(async project => {
        const outDir = path.join(project.basePath, 'dist')
        rimraf.sync(outDir)
        mkdirp.sync(outDir)
        if (project.sourceMatch.length > 0) {
          await watchSrc(project.sourceMatch, project.ignored, project.basePath)
        }
        if (project.entrypoints.length > 0) {
          await bundleApp(project.entrypoints, outDir, true)
        }
      })
    )
  }

  return { addProject, build, watch }
}

export const eachPackages = async (cb: (s: string) => void) => {
  const packages = await readDir('packages')
  packages.forEach(s => cb(s))
}

// const build = async () => {
//   process.env.NODE_ENV = 'production'
//   const options = require('../tsconfig.json')
//   const outDir = options.compilerOptions.outDir
//   rimraf.sync(outDir)
//   mkdirp.sync(outDir)
//   await buildSrc('src/**/*.ts')
//   await bundleApp('app/index.html', false)
//   await buildPkg()
// }

// const subcommands = { watch, build }

// if (process.argv.length < 3 || !(process.argv[2] in subcommands)) {
//   process.exit(1)
// }

// subcommands[process.argv[2]]()
