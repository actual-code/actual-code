import { Reporter, Report } from './reporter'
import { getCodeBlocks, parse, MDAST, CodeBlock } from '../source'
import { createStorage, Storage, AppState } from '../storage'
import nodeJsPlugin from '../plugins/node-js'
import shellPlugin from '../plugins/shell'
import htmlPlugin from '../plugins/html'

import { SandboxOptions, ActualCodeSandbox, SandboxPlugin } from './sandbox'

export type Transform = (input: Report) => Promise<Report>
export type Output = (results: { [props: string]: Report[] }) => Promise<any>

export interface ResultProcessor {
  transform?: Transform
  output?: Output
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
  private _reporter: Reporter = new Reporter()
  private _init: Promise<void>
  private _runningState: Promise<any> = null
  private _sandbox: ActualCodeSandbox
  id: string
  private _storage?: Storage
  private _plugins: ActualCodePlugin[] = [nodeJsPlugin, shellPlugin, htmlPlugin]
  private _resultProcessors: ResultProcessorPlugin[] = []

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

  private async _addPlugin(plugin: ActualCodePlugin) {
    const { name, sandbox, resultProcessor } = plugin()
    this._reporter.event('register plugin', { name })
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
    return this._storage.readById(this.id)
  }

  async run(code: string, opts: SandboxOptions) {
    await this._init
    const { settings, root } = await parse(code)
    const codeBlocks = await getCodeBlocks(root)

    const resultProcessors: ResultProcessor[] = []
    for (const plugin of this._resultProcessors) {
      resultProcessors.push(await plugin(root, codeBlocks))
    }

    const results: { [props: string]: Report[] } = {}

    this._reporter.setCallback(async report => {
      await this._init

      for (const p of resultProcessors) {
        if (p.transform) {
          report = await p.transform(report)
          if (!report) {
            return
          }
        }
      }

      if (!(report.hash in results)) {
        results[report.hash] = []
      }
      results[report.hash].push(report)
    })

    const outputProcessor = resultProcessors.find(p => 'output' in p)

    const runner = async () => {
      this._reporter.debug('run markdown script')

      for (const codeBlock of codeBlocks) {
        await this._sandbox.run(codeBlock, opts)
      }

      if (opts.runMode) {
        await this.save(code, results)
      }
      if (outputProcessor) {
        return outputProcessor.output(results)
      } else {
        return null
      }
    }
    this._runningState = runner()

    if (outputProcessor) {
      return outputProcessor.output(null)
    } else {
      return null
    }
  }

  async save(code: string, results?: { [props: string]: Report[] }) {
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
}
