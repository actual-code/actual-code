import { Sandbox, SandboxOptions, SandboxPlugin } from '../actual-code'
import { Reporter } from '../reporter'

export class HtmlSandbox implements Sandbox {
  rootPath: string
  reporter: Reporter
  constructor(reporter: Reporter, rootPath: string) {
    this.rootPath = rootPath
    this.reporter = reporter
  }

  async run(
    code: string,
    hash: string,
    filetype: string,
    meta: SandboxOptions
  ) {
    if (filetype !== 'html') {
      return false
    }
    this.reporter.output('text/html', code)
    return true
  }
}

const plugin: SandboxPlugin = async (reporter, rootPath) => {
  return new HtmlSandbox(reporter, rootPath)
}

export default plugin
