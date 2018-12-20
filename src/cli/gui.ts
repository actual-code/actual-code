import * as path from 'path'
import { inspect } from 'util'

import * as carlo from 'carlo'
import { rpc } from 'carlo/rpc'

import { ActualCode } from '../actual-code'
import { Reporter, ReporterOptions } from '../reporter'
import { setup, updateState, getFileList } from '../app-state'

import { stringifyHtml } from '../source/markdown'

const outDir = path.join(__dirname, '..', '..', 'app')

export class CarloReporter implements Reporter {
  disableInfo: boolean
  disableLog: boolean
  disableDebug: boolean
  cb: (type, data) => Promise<void> = async (type, data) => {
    console.log(type, data)
  }

  constructor(opts: ReporterOptions = {}) {
    this.disableLog = !!opts.disableLog
    this.disableInfo = !!opts.disableInfo
    this.disableDebug = !!opts.disableDebug
  }

  async info(message: string) {
    if (!this.disableInfo) {
      await this.cb('info', message)
    }
  }

  async log(message: string) {
    if (!this.disableLog) {
      await this.cb('log', message)
    }
  }

  async debug(message: string) {
    if (!this.disableDebug) {
      await this.cb('debug', message)
    }
  }

  async writeStdout(data: string | Buffer) {
    await this.cb('stdout', data)
  }

  async writeStderr(data: string | Buffer) {
    await this.cb('stderr', data)
  }

  setCallback(cb) {
    this.cb = cb
  }
}

export const bootGui = async opt => {
  const reporter = new CarloReporter(opt)
  reporter.info('GUI mode')
  let actualCode: ActualCode
  let appState
  let filename

  const cApp = await carlo.launch()
  cApp.serveFolder(outDir)
  const window = cApp.mainWindow()
  const page = window.pageForTest()
  page.on('console', message => {
    reporter.info(message.type())
    reporter.info(message.text())
    reporter.info(message.args())
  })

  cApp.serveHandler(request => {
    reporter.debug(`REQ ${request.url()}`)
    request.continue()
  })

  await cApp.exposeFunction('initSandbox', async (name: string) => {
    filename = name
    reporter.debug('init sandbox')
    appState = await setup(filename)
    actualCode = new ActualCode(appState, reporter)
    return { ...appState, code: actualCode.code }
  })
  await cApp.exposeFunction(
    'runMarkdown',
    async (code: string, runMode: boolean) => {
      const { vfile, settings } = await actualCode.run(code, { runMode })
      reporter.debug(`settings: ${JSON.stringify(settings)}`)

      if (appState) {
        const tags = settings.tags || ''
        const found = vfile.children.find(child => child.type === 'heading')
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
        appState.updatedAt = Date.now()
        updateState(filename, appState)
      }

      return stringifyHtml(vfile)
    }
  )
  await cApp.exposeFunction('getFileList', () => getFileList())
  await cApp.load('index.html', rpc.handle(reporter))
}
