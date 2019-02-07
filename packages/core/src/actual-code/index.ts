import { getCodeBlocks, parse, MDAST, CodeBlock } from '@actual-code/source'

import { Reporter } from './reporter'
import { Storage, AppState } from '../storage'
import { SandboxOptions, ActualCodeSandbox, SandboxPlugin } from './sandbox'
import nodeJsPlugin from '../plugins/node-js'
import shellPlugin from '../plugins/shell'
import htmlPlugin from '../plugins/html'

export interface Output {
  type: 'output' | 'event' | 'log' | 'debug'
  subType?: string
  hash?: string
  data?: string | Buffer
  payload?: any
}

export interface Results {
  [props: string]: Output[]
}

export type OutputPlugin = (
  root: MDAST.Root,
  codeBlocks: CodeBlock[]
) => Promise<(results: Results) => Promise<any>>

/**
 * Transform sandbox execution result.
 * Called each time during sandbox is running.
 */
export type TransformPlugin = (
  root: MDAST.Root,
  codeBlocks: CodeBlock[]
) => Promise<(output: Output) => Promise<Output>>

/**
 * actual-code plugin
 * @param name - plugin name
 * @param sandbox - implementation Sandbox plugin
 * @param resultProcessor - implementation ResultProcessor plugin
 */
export type ActualCodePlugin = () => {
  name: string
  sandbox?: SandboxPlugin
  output?: OutputPlugin | OutputPlugin[]
  transform?: TransformPlugin | TransformPlugin[]
}

export class ActualCode {
  id: string
  private _reporter: Reporter = new Reporter()
  private _init: Promise<void>
  private _runningState: Promise<any> = null
  private _sandbox: ActualCodeSandbox
  private _storage?: Storage
  private _plugins: ActualCodePlugin[] = [nodeJsPlugin, shellPlugin, htmlPlugin]
  private _outputPlugins: OutputPlugin[] = []
  private _transformPlugins: TransformPlugin[] = []

  constructor(id: string, storage?: Storage) {
    this.id = id
    this._storage = storage
    const init = async () => {
      this._sandbox = new ActualCodeSandbox(this, this._reporter)
      for (const plugin of this._plugins) {
        await this._addPlugin(plugin)
      }
    }
    this._init = init()
  }

  async registerPlugin(plugin: ActualCodePlugin | string) {
    if (typeof plugin === 'string') {
      await this._addPlugin(eval(plugin))
    } else {
      await this._addPlugin(plugin)
    }
  }

  async getAppState(): Promise<AppState> {
    return this._storage.readById(this.id)
  }

  async run(code: string, opts: SandboxOptions) {
    await this._init
    const { root } = await parse(code)
    const codeBlocks = await getCodeBlocks(root)

    const transformPlugins = await Promise.all(
      this._transformPlugins.map(p => p(root, codeBlocks))
    )
    const outputPlugins = await Promise.all(
      this._outputPlugins.map(p => p(root, codeBlocks))
    )

    const results: { [props: string]: Output[] } = {}

    this._reporter.setCallback(async report => {
      await this._init

      for (const p of transformPlugins) {
        report = await p(report)
        if (!report) {
          return
        }
      }

      if (!(report.hash in results)) {
        results[report.hash] = []
      }
      results[report.hash].push(report)
    })

    const runner = async () => {
      this._reporter.debug('run markdown script')

      for (const codeBlock of codeBlocks) {
        await this._sandbox.run(codeBlock, opts)
      }

      if (opts.runMode) {
        await this.save(code, results)
      }
      if (outputPlugins.length > 0) {
        const snapshot = JSON.stringify(results)
        outputPlugins.forEach(p => p(JSON.parse(snapshot)))
      }
    }
    this._runningState = runner()

    if (outputPlugins.length > 0) {
      outputPlugins.forEach(p => p(null))
    }
  }

  async save(code: string, results?: { [props: string]: Output[] }) {
    await this._init

    if (this._storage) {
      await this._storage.updateAppState(this.id, code, results)
    }
  }

  async waitFinished() {
    const result = await this._runningState
    this._runningState = null
    return result
  }

  private async _addPlugin(plugin: ActualCodePlugin) {
    const { name, sandbox, output, transform } = plugin()
    this._reporter.event('register plugin', { name })
    if (sandbox) {
      await this._sandbox.addPlugin(sandbox)
    }
    if (output) {
      this._outputPlugins = this._outputPlugins.concat(output)
    }
    if (transform) {
      this._transformPlugins = this._transformPlugins.concat(transform)
    }
  }
}
