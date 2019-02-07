import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { promisify } from 'util'

import * as carlo from 'carlo'
import { rpc } from 'carlo/rpc'
import * as mkdirp from 'mkdirp'

import { ActualCode, ActualCodePlugin, Output } from '@actual-code/core'
import { createStorage, Storage } from '@actual-code/core'
import {
  MDAST,
  stringifyHtml,
  CodeBlock,
  insertAfter,
} from '@actual-code/source'

const readFile = promisify(fs.readFile)

const actualCodeCarloPlugin = (): ActualCodePlugin => () => {
  const createOutput = (
    root: MDAST.Root,
    codeBlocks: CodeBlock[]
  ): Output => async results => {
    codeBlocks.reverse().forEach(codeBlock => {
      if (results && codeBlock.hash in results) {
        const value = results[codeBlock.hash].reduce(
          (acc, res) => acc + res.data,
          ''
        )
        const node: MDAST.Code = { type: 'code', value }
        insertAfter(root, codeBlock.pointers, node)
      }
    })
    return stringifyHtml(root)
  }
  return {
    name: 'actual-code carlo app',
    resultProcessor: async (root, codeBlocks) => {
      return {
        output: createOutput(root, codeBlocks),
      }
    },
  }
}

class Backend {
  _storage: Storage
  constructor(storage: Storage) {
    this._storage = storage
  }

  initActualCode(id: string) {
    const actualCode = new ActualCode(id, this._storage)

    actualCode.registerPlugin(actualCodeCarloPlugin())
    return rpc.handle(actualCode)
  }
}

export const bootGui = async opt => {
  const storage = await createStorage()
  const backend = new Backend(storage)
  // reporter.log('GUI mode')

  const userDataDir = path.join(os.homedir(), '.actual-code', 'carlo')
  mkdirp.sync(userDataDir)
  const cApp = await carlo.launch({
    userDataDir,
    title: 'actual-code',
  })

  const appSourceDir = path.dirname(require.resolve('@actual-code/gui'))
  console.log(appSourceDir)
  cApp.serveHandler(async req => {
    const p = req.url().replace(/^https:\/\/domain\//, '')
    try {
      const body = await readFile(path.join(appSourceDir, p))
      req.fulfill({ body })
    } catch (e) {
      if (e.code === 'ENOENT') {
        req.fulfill({ status: '404' })
      } else {
        req.fulfill({ status: '500' })
      }
    }
  })

  const window = cApp.mainWindow()
  // const page = window.pageForTest()
  // page.on('console', message => {
  //   console.log(message.type())
  //   console.log(message.text())
  //   console.log(message.args())
  // })

  await cApp.exposeFunction('stringifyHtml', async vfile =>
    stringifyHtml(vfile)
  )
  await cApp.exposeFunction('getFileList', () => storage.find())
  await cApp.load('index.html', rpc.handle(backend))
}
