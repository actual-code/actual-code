import { Reporter } from '../reporter'
import { getCodeBlocks, parse } from './parse'
import { Sandbox, SandboxOptions, createSandbox } from '../sandbox'
import { setup } from '../app-state'

const createErrorNode = value => ({ type: 'code', lang: 'error', value })
const createResultNode = outputs => ({
  type: 'code',
  value: outputs.map(({ name, value }) => `-- ${name}\n${value}`).join('\n')
})

const mergeOption = (
  opt1: SandboxOptions,
  opt2: SandboxOptions
): SandboxOptions => {
  // console.log(opt1)
  // console.log(opt2)
  return {
    rootPath: opt2.rootPath || opt1.rootPath,
    timeout: opt2.timeout || opt1.timeout,
    runMode: 'runMode' in opt2 ? opt2.runMode : opt1.runMode,
    browser: opt2.browser || opt1.browser,
    file: opt2.file
  }
}

export const createMarkdownRunner = async (
  filename: string,
  appState,
  reporter: Reporter
) => {
  const rootPath = appState.path
  const box = createSandbox(reporter, { rootPath })
  let cache = []

  const run = async (markdownText: string, opts: SandboxOptions) => {
    const cwd = process.cwd()

    reporter.debug('run markdown script')

    const { settings, vfile } = await parse(markdownText)
    const codeBlocks = await getCodeBlocks(vfile)

    const insertNodes = []
    let i = 0
    for (const codeBlock of codeBlocks) {
      const { code, filetype, meta, parent, index } = codeBlock
      let { outputs, error, nodes } = await box.run(
        code,
        filetype,
        mergeOption(opts, meta)
      )

      if (opts.runMode || meta.runMode) {
        cache[i] = { outputs, code }
      } else {
        if (cache.length > i) {
          if (cache[i].code === code) {
            outputs = cache[i].outputs
          } else {
            // cache purge
            cache[i] = { code: null, outputs: [] }
          }
        }
      }

      if (error) {
        insertNodes.push({ parent, index, node: createErrorNode(error) })
      } else {
        if (outputs.length > 0 && !meta.quiet) {
          insertNodes.push({ parent, index, node: createResultNode(outputs) })
        }
        nodes.forEach(node => {
          insertNodes.push({ parent, index, node })
          // console.log(JSON.stringify(node, null, '  '))
        })
      }

      i++
    }

    insertNodes.reverse().forEach(({ parent, index, node }) => {
      parent.children = [
        ...parent.children.slice(0, index + 1),
        node,
        ...parent.children.slice(index + 1)
      ]
    })

    process.chdir(cwd)

    return { vfile, settings }
  }
  return {
    run,
    code: appState.code
  }
}
