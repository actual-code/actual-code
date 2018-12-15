import * as path from 'path'

import * as carlo from 'carlo'

import { runMarkdown } from '../markdown/runner'
import { Reporter } from '../reporter'
import { setup } from '../setup'
import { createSandbox, Sandbox, SandboxOptions } from '../sandbox'

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
  const appState = await setup('hoge.md')
  const rootPath = appState.path
  const box = createSandbox(reporter, { rootPath })
  gui(async cApp => {
    await cApp.exposeFunction(
      'runMarkdown',
      async (code: string, runMode: boolean) => {
        const vfile = await runMarkdown(code, box, reporter, {
          rootPath,
          runMode
        })
        return stringifyHtml(vfile)
      }
    )
    ;(global as any).cApp = cApp
  })
}
