import * as path from 'path'

import * as carlo from 'carlo'

import { createMarkdownRunner } from '../markdown/runner'
import { Reporter } from '../reporter'
import { setup, updateState } from '../app-state'

import { stringifyHtml } from '../markdown'

const outDir = path.join(__dirname, '..', '..', 'dist', 'app')

export const gui = async cb => {
  const cApp = await carlo.launch()
  cApp.serveFolder(outDir)
  await cb(cApp)
  await cApp.load('index.html')
}

export const bootGui = async () => {
  const reporter = new Reporter()
  let run
  let appState
  let filename
  gui(async cApp => {
    await cApp.exposeFunction('initSandbox', async (name: string) => {
      filename = name
      appState = await setup(name)
      const { rootPath } = appState

      const runner = await createMarkdownRunner(filename, appState, reporter)
      run = runner.run
      return runner.code
    })
    await cApp.exposeFunction(
      'runMarkdown',
      async (code: string, runMode: boolean) => {
        if (appState) {
          appState.code = code
          updateState(filename, appState)
        }
        const vfile = await run(code, { runMode })
        return stringifyHtml(vfile)
      }
    )
    ;(global as any).cApp = cApp
  })
}
