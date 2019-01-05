import * as path from 'path'
import { inspect } from 'util'

import * as carlo from 'carlo'
import { rpc } from 'carlo/rpc'

import { ActualCode, Result, ResultProcessorPlugin } from '../actual-code'
import { Reporter, ReporterOptions } from '../actual-code/reporter'
import { createStorage, Storage } from '../storage'

import { stringifyHtml } from '../source/unified'

const outDir = path.join(__dirname, '..', 'app')

class Backend {
  _reporter: Reporter
  _storage: Storage
  constructor(reporter: Reporter, storage: Storage) {
    this._reporter = reporter
    this._storage = storage
  }

  initActualCode(id: string) {
    const actualCode = new ActualCode(id, this._reporter, this._storage)

    actualCode.registerPlugin(() => ({
      name: 'carlo apps',
      resultProcessor: async (root, codeBlocks) => {
        return {
          output: async () => {
            return stringifyHtml(root)
          }
        }
      }
    }))
    return rpc.handle(actualCode)
  }
}

export const bootGui = async opt => {
  const reporter = new Reporter()
  const storage = await createStorage()
  const backend = new Backend(reporter, storage)
  reporter.log('GUI mode')

  const cApp = await carlo.launch()
  cApp.serveFolder(outDir)
  const window = cApp.mainWindow()
  // const page = window.pageForTest()
  // page.on('console', message => {
  //   console.log(message.type())
  //   console.log(message.text())
  //   console.log(message.args())
  // })

  // cApp.serveHandler(request => {
  //   reporter.debug(`REQ ${request.url()}`)
  //   request.continue()
  // })

  await cApp.exposeFunction('stringifyHtml', async vfile =>
    stringifyHtml(vfile)
  )
  await cApp.exposeFunction('getFileList', () => storage.find())
  await cApp.load('index.html', rpc.handle(reporter), rpc.handle(backend))
}
