import { Output, Sandbox, SandboxOptions } from '.'
import { Reporter } from '../reporter'

import remark from '../markdown'

export class HtmlSandbox implements Sandbox {
  reporter: Reporter
  constructor(reporter: Reporter, opts: SandboxOptions) {
    this.reporter = reporter
  }

  async run(code: string, filetype: string, meta: any = {}) {
    const nodes = remark.parse(code).children
    return { outputs: [], error: null, nodes }
  }
}
