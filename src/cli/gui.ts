import * as path from 'path'
import { inspect } from 'util'

import * as carlo from 'carlo'

import { ActualCode } from '../actual-code'
import { Reporter } from '../reporter'
import { setup, updateState, getFileList } from '../app-state'

import { stringifyHtml } from '../source/markdown'

const outDir = path.join(__dirname, '..', '..', 'app')

export const gui = async cb => {
  const cApp = await carlo.launch()
  cApp.serveFolder(outDir)
  await cb(cApp)
  await cApp.load('index.html')
}

export const bootGui = async opt => {
  const reporter = new Reporter(opt)
  reporter.info('GUI mode')
  let actualCode: ActualCode
  let appState
  let filename
  gui(async cApp => {
    const window = cApp.mainWindow()
    const page = window.pageForTest()
    page.on('console', message => {
      reporter.info(message.type())
      reporter.info(message.text())
      reporter.info(message.args())
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
  })
}
