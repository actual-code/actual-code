import { Reporter, ReporterOptions } from '../reporter'
import { getCodeBlocks, parse, MDAST } from '../source'
import { readAppState, updateAppState, AppState } from './state'
import nodeJsPlugin from '../plugins/node-js'
import shellPlugin from '../plugins/shell'
import htmlPlugin from '../plugins/html'

import { SandboxOptions, ActualCodeSandbox, SandboxPlugin } from './sandbox'

export interface Result {
  filetype: string
  data: string | Buffer
}

export interface Transformer {
  transform: (input: Result) => Promise<Result>
}

export type TransformPlugin = () => Promise<Transformer>

export interface Traverser {
  traverse: (node: MDAST.Node, isEnter: boolean) => Promise<void>
}

export type ActualCodePlugin = () => {
  name: string
  sandbox?: SandboxPlugin
  transformer?: TransformPlugin
  traverser?: () => Promise<Traverser>
}

export class ActualCode {
  private _reporter: Reporter
  private _init: Promise<void>
  private _initState: Promise<AppState>
  private _runningState: Promise<void> = null
  private _sandbox: ActualCodeSandbox
  id: string
  private _plugins: ActualCodePlugin[] = [nodeJsPlugin, shellPlugin, htmlPlugin]

  constructor(id: string, reporter: Reporter) {
    this.id = id
    this._reporter = reporter
    this._initState = readAppState(id)
    this._init = this._initState.then(async appState => {
      this._sandbox = new ActualCodeSandbox(this, this._reporter, appState)
      for (const plugin of this._plugins) {
        await this._addPlugin(plugin)
      }
    })
  }

  private async _addPlugin(plugin: ActualCodePlugin) {
    const { name, sandbox } = plugin()
    this._reporter.info('register plugin', name)
    if (sandbox) {
      this._sandbox.addPlugin(sandbox)
    }
  }

  async registerPlugin(plugin: ActualCodePlugin | string) {
    if (typeof plugin === 'string') {
      this._addPlugin(eval(plugin))
    } else {
      this._addPlugin(plugin)
    }
  }

  getAppState() {
    return this._initState
  }

  async run(code: string, opts: SandboxOptions) {
    const appState = await this._initState
    await this._init
    const { settings, root } = await parse(code)
    const codeBlocks = await getCodeBlocks(root)

    const runner = async () => {
      this._reporter.debug('run markdown script')

      for (const codeBlock of codeBlocks) {
        await this._sandbox.run(codeBlock, opts)
      }

      this._reporter.setHash(null)
      await this._updateAppState(appState, code, settings, root)
    }
    this._runningState = runner()

    return { settings, node: root, codeBlocks }
  }

  private async _updateAppState(
    appState: AppState,
    code: string,
    settings,
    root: MDAST.Root
  ) {
    const tags = settings.tags || ''
    const found = root.children.find(
      child => child.type === 'heading'
    ) as MDAST.Heading
    const title =
      found &&
      found.children &&
      found.children
        .map(child => child.value)
        .filter(s => s)
        .join(' ')
    appState.code = code
    appState.title = title
    appState.tags = typeof tags === 'string' ? tags.split(/[ ,]/) : tags
    await updateAppState(this.id, appState)
  }

  async waitFinished() {
    await this._runningState
    this._runningState = null
  }
}
