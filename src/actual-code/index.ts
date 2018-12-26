import { Reporter, ReporterOptions } from '../reporter'
import { getCodeBlocks, parse, MDAST } from '../source'
import { Sandbox, createSandbox, SandboxOptions } from '../sandbox'
import { setup, updateState, AppState } from '../app-state'
import { run } from './runner'

export class ActualCode {
  private _reporter: Reporter
  private _initSandbox: Promise<any>
  private _initState: Promise<AppState>
  private _runningState: Promise<void> = null
  id: string

  constructor(id: string, reporter: Reporter) {
    this.id = id
    this._reporter = reporter
    this._initState = setup(id)
    this._initSandbox = this._initState.then(appState =>
      createSandbox(reporter, appState.path)
    )
  }

  getAppState() {
    return this._initState
  }

  async run(markdownText: string, opts: SandboxOptions) {
    const appState = await this._initState
    const sandbox = await this._initSandbox
    const { settings, node } = await parse(markdownText)
    const codeBlocks = await getCodeBlocks(node)

    this._runningState = run(this._reporter, sandbox, codeBlocks, opts).then(
      () => {
        const tags = settings.tags || ''
        const found = node.children.find(
          child => child.type === 'heading'
        ) as MDAST.Heading
        const title =
          found &&
          found.children &&
          found.children
            .map(child => child.value)
            .filter(s => s)
            .join(' ')
        appState.code = markdownText
        appState.title = title
        appState.tags = typeof tags === 'string' ? tags.split(/[ ,]/) : tags
        updateState(this.id, appState)
      }
    )

    return { settings, node, codeBlocks }
  }

  async waitFinished() {
    await this._runningState
    this._runningState = null
  }
}
