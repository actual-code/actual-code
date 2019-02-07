import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import { ActualCode, SandboxOptions } from '@actual-code/core'
import { actualCodeCliPlugin, ActualCodeCliPluginParams } from './cli-plugin'
const readFile = promisify(fs.readFile)

export const runner = async (
  filename: string,
  params: ActualCodeCliPluginParams
) => {
  filename = path.resolve(filename)
  if (params.output) {
    params.output = path.resolve(params.output)
  }
  if (params.convert) {
    params.convert = path.resolve(params.convert)
  }

  const text = (await readFile(filename)).toString()

  // reporter.event('read file', { filename })
  const actualCode = new ActualCode(filename)
  actualCode.registerPlugin(actualCodeCliPlugin(params))

  const sandboxOpts: SandboxOptions = {
    runMode: true,
  }

  await actualCode.run(text, sandboxOpts)
  await actualCode.waitFinished()
}
