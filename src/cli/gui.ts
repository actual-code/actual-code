import * as path from 'path'
import { inspect } from 'util'

import * as carlo from 'carlo'
import { rpc } from 'carlo/rpc'

import { ActualCode } from '../actual-code'
import { Reporter, ReporterOptions } from '../reporter'
import { getFileList } from '../app-state'

import { stringifyHtml } from '../source/unified'

const outDir = path.join(__dirname, '..', '..', 'app')

class Backend {
  reporter: Reporter
  constructor(reporter: Reporter) {
    this.reporter = reporter
  }
  initActualCode(id: string) {
    return rpc.handle(new ActualCode(id, this.reporter))
  }
}

export const bootGui = async opt => {
  const reporter = new Reporter(opt)
  const backend = new Backend(reporter)
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
  await cApp.exposeFunction('getFileList', async () => getFileList())
  await cApp.load('index.html', rpc.handle(reporter), rpc.handle(backend))
}
