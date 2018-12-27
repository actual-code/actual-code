import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'

const mkdtemp = promisify(fs.mkdtemp)
const writeFile = promisify(fs.writeFile)

import { Reporter, ReporterOptions } from '../reporter'
import { getCodeBlocks, parse, MDAST } from '../source'
import { readAppState, updateAppState, AppState } from './state'
import nodeJsPlugin from '../plugins/node-js'
import shellPlugin from '../plugins/shell'
import htmlPlugin from '../plugins/html'

import { Sandbox, SandboxOptions, ActualCodePlugin } from '../'

const mergeOption = (
  opt1: SandboxOptions,
  opt2: SandboxOptions
): SandboxOptions => {
  return {
    rootPath: opt2.rootPath || opt1.rootPath,
    timeout: opt2.timeout || opt1.timeout,
    runMode: 'runMode' in opt2 ? opt2.runMode : opt1.runMode,
    browser: opt2.browser || opt1.browser,
    file: opt2.file
  }
}

export class ActualCode {
  private _reporter: Reporter
  private _initSandbox: Promise<void>
  private _initState: Promise<AppState>
  private _runningState: Promise<void> = null
  rootPath: string
  id: string
  private _plugins: ActualCodePlugin[] = [nodeJsPlugin, shellPlugin, htmlPlugin]
  private _boxes: Sandbox[] = []

  constructor(id: string, reporter: Reporter) {
    this.id = id
    this._reporter = reporter
    this._initState = readAppState(id)
    this._init()
  }

  private _init() {
    this._initSandbox = this._initState.then(async appState => {
      if (!appState.path || !fs.existsSync(appState.path)) {
        appState.path = await mkdtemp(path.join(os.tmpdir(), 'actual-'))
      }
      this.rootPath = appState.path
      process.chdir(this.rootPath)
      this._reporter.debug('create Sandbox')

      for (const plugin of this._plugins) {
        await this._addPlugin(plugin)
      }
    })
  }

  private async _addPlugin(plugin: ActualCodePlugin) {
    const { name, sandbox } = plugin()
    this._reporter.info('register plugin', name)
    if (sandbox) {
      this._boxes.push(await sandbox(this._reporter, this.rootPath))
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
    await this._initSandbox
    const { settings, root } = await parse(code)
    const codeBlocks = await getCodeBlocks(root)

    const runner = async () => {
      this._reporter.debug('run markdown script')

      for (const codeBlock of codeBlocks) {
        const { code, filetype, meta, hash } = codeBlock
        const opts2 = mergeOption(opts, meta)

        if (meta.plugin) {
          await this.registerPlugin(code)
          continue
        }
        this._reporter.setHash(hash)
        if (!opts2.runMode) {
          this._reporter.info('sandbox skip', hash)
          continue
        }

        this._reporter.info('sandbox run', hash)

        if (opts2.file) {
          await writeFile(opts2.file, code)
        }

        for (const box of this._boxes) {
          if (await box.run(code, hash, filetype, opts2)) {
            break
          }
        }
        this._reporter.info('sandbox end', hash)
      }

      this._reporter.setHash(null)

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
      updateAppState(this.id, appState)
    }
    this._runningState = runner()

    return { settings, node: root, codeBlocks }
  }

  async waitFinished() {
    await this._runningState
    this._runningState = null
  }
}
