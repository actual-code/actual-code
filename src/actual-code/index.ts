import { Reporter, ReporterOptions } from './reporter'
import { getCodeBlocks, parse, MDAST, CodeBlock } from '../source'
import { createStorage, Storage, AppState } from '../storage'
import nodeJsPlugin from '../plugins/node-js'
import shellPlugin from '../plugins/shell'
import htmlPlugin from '../plugins/html'

import { SandboxOptions, ActualCodeSandbox, SandboxPlugin } from './sandbox'

export interface Result {
  hash: string
  filetype: string
  data: string | Buffer
}

export interface ResultProcessor {
  transform?: (input: Result) => Promise<Result>
  output?: () => Promise<any>
}

export type ResultProcessorPlugin = (
  root: MDAST.Root,
  codeBlocks: CodeBlock[]
) => Promise<ResultProcessor>

export type ActualCodePlugin = () => {
  name: string
  sandbox?: SandboxPlugin
  resultProcessor?: ResultProcessorPlugin
}

export class ActualCode {
  private _reporter: Reporter
  private _init: Promise<void>
  private _runningState: Promise<void> = null
  private _sandbox: ActualCodeSandbox
  id: string
  private _storage?: Storage
  private _plugins: ActualCodePlugin[] = [nodeJsPlugin, shellPlugin, htmlPlugin]
  private _resultProcessors: ResultProcessorPlugin[] = []

  constructor(id: string, reporter: Reporter, storage?: Storage) {
    this.id = id
    this._reporter = reporter
    this._storage = storage
    const init = async () => {
      this._sandbox = new ActualCodeSandbox(this, this._reporter)
      for (const plugin of this._plugins) {
        await this._addPlugin(plugin)
      }
    }
    this._init = init()
  }

  private async _addPlugin(plugin: ActualCodePlugin) {
    const { name, sandbox, resultProcessor } = plugin()
    this._reporter.info('register plugin', name)
    if (sandbox) {
      await this._sandbox.addPlugin(sandbox)
    }
    if (resultProcessor) {
      this._resultProcessors.push(resultProcessor)
    }
  }

  async registerPlugin(plugin: ActualCodePlugin | string) {
    if (typeof plugin === 'string') {
      await this._addPlugin(eval(plugin))
    } else {
      await this._addPlugin(plugin)
    }
  }

  async getAppState(): Promise<AppState> {
    this._init
    return this._storage.readAppState(this.id)
  }

  async run(code: string, opts: SandboxOptions) {
    await this._init
    const { settings, root } = await parse(code)
    const codeBlocks = await getCodeBlocks(root)

    const resultProcessors: ResultProcessor[] = []
    for (const plugin of this._resultProcessors) {
      resultProcessors.push(await plugin(root, codeBlocks))
    }

    this._reporter.addCallback(async (filetype, hash, data) => {
      await this._init

      for (const p of resultProcessors) {
        if (p.transform) {
          const res = await p.transform({ hash, filetype, data })
          hash = res.hash
          filetype = res.filetype
          data = res.data
        }
      }
    })

    const runner = async () => {
      this._reporter.debug('run markdown script')

      for (const codeBlock of codeBlocks) {
        await this._sandbox.run(codeBlock, opts)
      }

      this._reporter.setHash(null)
      if (opts.runMode) {
        await this._updateAppState(code, root)
      }
    }
    this._runningState = runner()

    const outputProcessor = resultProcessors.find(p => 'output' in p)
    if (outputProcessor) {
      return outputProcessor.output()
    } else {
      return null
    }

    // return { settings, node: root, codeBlocks }
  }

  async save(code: string) {
    const { root } = await parse(code)
    await this._updateAppState(code, root)
  }

  private async _updateAppState(code: string, root: MDAST.Root) {
    await this._init
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

    if (this._storage) {
      await this._storage.updateAppState(this.id, { code, title })
    }
  }

  async waitFinished() {
    await this._runningState
    this._runningState = null
  }
}
