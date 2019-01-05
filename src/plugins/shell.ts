import childProcess from 'child_process'

import { Sandbox, SandboxOptions } from '../actual-code/sandbox'
import { ActualCodePlugin } from '../actual-code'

import { Reporter } from '../actual-code/reporter'

const exec = (cmd: string, reporter: Reporter, hash: string) => {
  return new Promise((resolve, reject) => {
    reporter.log(`run ${cmd}`)
    const proc = childProcess.exec(cmd)
    proc.stdout.on('data', chunk => {
      reporter.output(hash, 'stdout', chunk)
    })
    proc.stderr.on('data', chunk => {
      reporter.output(hash, 'stderr', chunk)
    })
    proc.on('close', code => {
      resolve()
    })
    proc.on('error', err => {
      reject(err)
    })
  })
}

export class ShellSandbox implements Sandbox {
  rootPath: string
  filetypes = {
    sh: 'sh',
    shell: 'sh'
  }
  reporter: Reporter
  constructor(reporter: Reporter, rootPath: string) {
    this.rootPath = rootPath
    this.reporter = reporter
  }
  async run(
    code: string,
    hash: string,
    filetype: string,
    meta: SandboxOptions
  ) {
    filetype = this.filetypes[filetype]
    if (!filetype) {
      return false
    }
    if (code.startsWith('#! ')) {
      await exec(code, this.reporter, hash)
    } else {
      for (let line of code.split('\n')) {
        line = line.trimLeft()
        if (line.startsWith('$ ')) {
          line = line.slice(2)
        }
        await exec(line, this.reporter, hash)
      }
    }
    return true
  }
}

const plugin: ActualCodePlugin = () => {
  return {
    name: 'shell',
    sandbox: async (reporter, rootPath) => new ShellSandbox(reporter, rootPath)
  }
}

export default plugin
