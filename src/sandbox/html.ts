import { Output, Sandbox, SandboxOptions } from '.'
import { Reporter } from '../reporter'
import { parseMarkdown } from '../source/markdown'
export class HtmlSandbox implements Sandbox {
  reporter: Reporter
  constructor(reporter: Reporter, opts: SandboxOptions) {
    this.reporter = reporter
  }

  async run(code: string, filetype: string, meta: any = {}) {
    const nodes = parseMarkdown(code).children
    return { outputs: [], error: null, nodes }
  }
}
