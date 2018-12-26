import { Reporter } from '../reporter'
import { Sandbox, SandboxOptions } from '../sandbox'
import { CodeBlock } from '../source'

const mergeOption = (
  opt1: SandboxOptions,
  opt2: SandboxOptions
): SandboxOptions => {
  return {
    rootPath: opt2.rootPath || opt1.rootPath,
    timeout: opt2.timeout || opt1.timeout,
    runMode: 'runMode' in opt2 ? opt2.runMode : opt1.runMode,
    browser: opt2.browser || opt1.browser,
    file: opt2.file
  }
}

export const run = async (
  reporter: Reporter,
  box: Sandbox,
  codeBlocks: CodeBlock[],
  opts: SandboxOptions
) => {
  reporter.debug('run markdown script')

  const insertNodes = []
  let i = 0
  for (const codeBlock of codeBlocks) {
    const { code, filetype, meta, parent, index, hash } = codeBlock
    const opts2 = mergeOption(opts, meta)

    reporter.setHash(hash)
    await box.run(code, hash, filetype, opts2)
  }

  reporter.setHash(null)
}
