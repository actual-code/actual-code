import { Sandbox, SandboxOptions } from '../actual-code/sandbox'
import { ActualCodePlugin } from '../actual-code'
import { Reporter } from '../actual-code/reporter'

export class HtmlSandbox implements Sandbox {
  rootPath: string
  reporter: Reporter
  constructor(reporter: Reporter, rootPath: string) {
    this.rootPath = rootPath
    this.reporter = reporter
  }

  async run(code: string, hash: string, lang: string, meta: SandboxOptions) {
    if (lang !== 'html') {
      return false
    }
    this.reporter.output(hash, 'text/html', code)
    return true
  }
}

const plugin: ActualCodePlugin = () => {
  return {
    name: 'HTML',
    sandbox: async (reporter, rootPath) => new HtmlSandbox(reporter, rootPath)
  }
}

export default plugin
