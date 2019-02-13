import * as path from 'path'
import * as childProcess from 'child_process'

import { Sandbox, SandboxOptions } from '../actual-code/sandbox'
import { ActualCodePlugin } from '../actual-code'
import { Reporter } from '../actual-code/reporter'

import { parseMarkdown } from '@actual-code/source'

const _exec = (cmd: string) =>
  new Promise((resolve, reject) => {
    const proc = childProcess.exec(cmd)
    proc.stdout.on('data', chunk => {
      console.log(chunk)
    })
    proc.stderr.on('data', chunk => {
      console.log(chunk)
    })
    proc.on('close', code => {
      resolve()
    })
    proc.on('error', err => {
      reject(err)
    })
  })

const installParcel = async () => {
  await _exec('yarn add -D parcel-bundler')
}

export class BrowserSandbox implements Sandbox {
  reporter: Reporter
  rootPath: string

  constructor(reporter: Reporter, rootPath: string) {
    this.reporter = reporter
    this.rootPath = rootPath
  }

  async run(code: string, hash: string, lang: string, meta: SandboxOptions) {
    if (!meta.browser) {
      return false
    }

    if (lang !== 'html') {
      return false
    }

    await installParcel()
    const Bundler = require(path.join(
      process.cwd(),
      'node_modules',
      'parcel-bundler'
    ))

    const filename = meta.file
    const nodes = parseMarkdown(
      `<iframe src="https://domain/${filename}"></iframe>`
    ).children

    console.log(path.join(process.cwd(), filename))

    const outDir = path.join(process.cwd(), 'dist')
    const entryFile = path.join(process.cwd(), filename)
    const opts = {
      outDir,
      outFile: filename,
      sourceMaps: true,
      hmr: false,
      watch: false,
    }
    this.reporter.debug('parcel-bundler: compile')
    const bundler = new Bundler(entryFile, opts)
    await bundler.bundle()

    return true
  }
}

const plugin: ActualCodePlugin = () => {
  return {
    name: 'browser',
    sandbox: async (reporter, rootPath) =>
      new BrowserSandbox(reporter, rootPath),
  }
}

export default plugin
