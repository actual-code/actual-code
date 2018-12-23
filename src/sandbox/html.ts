import { Sandbox, SandboxOptions, SandboxPlugin } from '.'
import { Reporter } from '../reporter'

export class HtmlSandbox implements Sandbox {
  reporter: Reporter
  constructor(reporter: Reporter) {
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
  return new HtmlSandbox(reporter)
}

export default plugin
