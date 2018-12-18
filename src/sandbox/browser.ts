import * as path from 'path'

import Bundler from 'parcel-bundler'

import { Sandbox, SandboxOptions, SandboxResult, Output } from '.'
import { Reporter } from '../reporter'
import { parseMarkdown } from '../source/markdown'

export class BrowserSandbox implements Sandbox {
  reporter: Reporter
  rootPath: string

  constructor(reporter: Reporter, opts: SandboxOptions) {
    this.reporter = reporter
    this.rootPath = path.resolve(opts.rootPath)
  }

  async run(code: string, filetype: string, meta) {
    if (filetype === 'html') {
      const filename = meta.file
      const nodes = parseMarkdown(
        `<iframe src="https://domain/${filename}"></iframe>`
      ).children

      const outDir = path.join(__dirname, '..', '..', 'app')
      const entryFile = path.join(this.rootPath, filename)
      const opts = {
        outDir,
        outFile: filename,
        sourceMaps: true,
        hmr: false
      }
      const bundler = new Bundler(entryFile, opts)
      await bundler.bundle()

      return { outputs: [], error: null, nodes }
    }
    return { outputs: [], error: null, nodes: [] }
  }
}
