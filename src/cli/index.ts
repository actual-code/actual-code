import { convert } from '../convert'
import { gui } from '../gui'
import { runMarkdown } from '../markdown/runner'
import { Reporter } from '../reporter'
import { setup } from '../setup'
import { createSandbox, Sandbox, SandboxOptions } from '../sandbox'

import { stringifyHtml } from '../markdown'

const bootstrap = async () => {
  const usage = () => {
    console.log('usage actual-code [-o outputfile] [file.md]')
    process.exit(1)
  }

  let outputfile = null
  let isGui = false
  const argv = process.argv.slice(2)
  if (argv.length > 0) {
    while (argv[0].startsWith('-')) {
      const opt = argv.shift()
      switch (opt) {
        case '-o': {
          if (argv.length === 0) {
            usage()
          }
          outputfile = argv.shift()
          continue
        }
        case '--gui': {
          isGui = true
          continue
        }
        case '--': {
          break
        }
        default: {
          usage()
        }
      }

      break
    }
  }

  if (argv.length === 0) {
    isGui = true
  }

  // ちゃんと設計してから、あとで綺麗にする
  if (!isGui) {
    const filename = argv.shift()
    const doc = await convert(filename, outputfile)
  }

  if (isGui) {
    const reporter = new Reporter()
    const box = createSandbox(reporter)
    gui(async cApp => {
      const appState = await setup('hoge.md')
      await cApp.exposeFunction(
        'runMarkdown',
        async (code: string, runMode: boolean) => {
          const vfile = await runMarkdown(code, box, reporter, { runMode })
          return stringifyHtml(vfile)
        }
      )
      ;(global as any).cApp = cApp
    })
  }
}

bootstrap()
