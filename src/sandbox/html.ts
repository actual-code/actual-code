import { Output, Sandbox, SandboxOptions } from '.'
import { Reporter } from '../reporter'

import remark from '../markdown'

export class HtmlSandbox implements Sandbox {
  reporter: Reporter
  constructor(reporter: Reporter, opts: SandboxOptions) {
    this.reporter = reporter
  }

  async run(code: string, filetype: string, meta: any = {}) {
    console.log(code)
    const nodes = remark.parse(code).children
    console.log(nodes)
    return { outputs: [], error: null, nodes }
  }
}
