import { ActualCodePlugin, OutputPlugin } from '@actual-code/core'

import { convert } from './convert'
import { output } from './output'
import { createTransform } from './transform'

export interface ActualCodeCliPluginParams {
  isVerbose: boolean
  output: string
  convert: string
}

export const actualCodeCliPlugin = (
  params: ActualCodeCliPluginParams
): ActualCodePlugin => () => {
  const outputPlugins: OutputPlugin[] = []
  if (params.output) {
    outputPlugins.push(async (root, codeBlocks) => async results =>
      output(params.output, root, codeBlocks, results)
    )
  }
  if (params.convert) {
    outputPlugins.push(async (root, codeBlocks) => async results =>
      convert(root, codeBlocks, params.convert, results)
    )
  }
  return {
    name: 'actual-code CLI',
    transform: createTransform(params.isVerbose),
    output: outputPlugins,
  }
}
