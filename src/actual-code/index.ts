import { Reporter } from '../reporter'
import { getCodeBlocks, parse } from '../source'
import { Sandbox, createSandbox, SandboxOptions } from '../sandbox'
import { setup } from '../app-state'
import { run } from './runner'

export class ActualCode {
  private _reporter: Reporter
  private _sandboxPath: string
  private _sandbox: Sandbox
  code: string
  constructor(appState, reporter: Reporter) {
    this._reporter = reporter
    this._sandboxPath = appState.path
    this.code = appState.code
    this._sandbox = createSandbox(reporter, { rootPath: this._sandboxPath })
  }

  async run(markdownText: string, opts: SandboxOptions) {
    this.code = markdownText
    const cache = []
    const { settings, vfile } = await parse(markdownText)
    const codeBlocks = await getCodeBlocks(vfile)

    await run(this._reporter, this._sandbox, cache, codeBlocks, opts)
    return { settings, vfile }
  }
}
