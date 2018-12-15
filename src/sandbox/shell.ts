import childProcess from 'child_process'

import { Output, Sandbox, SandboxOptions } from '.'
import { Reporter } from '../reporter'

const exec = (cmd: string, reporter: Reporter) => {
  return new Promise<Output[]>((resolve, reject) => {
    const outputs: Output[] = []
    const proc = childProcess.exec(cmd)
    reporter.info(`run ${cmd}`)
    proc.stdout.on('data', chunk => {
      reporter.stdout.write(chunk)
      outputs.push({ name: 'stdout', value: chunk })
    })
    proc.stderr.on('data', chunk => {
      reporter.stderr.write(chunk)
      outputs.push({ name: 'stderr', value: chunk })
    })
    proc.on('close', code => {
      resolve(outputs)
    })
    proc.on('error', err => {
      reject(err)
    })
  })
}

export class ShellSandbox implements Sandbox {
  reporter: Reporter
  constructor(reporter: Reporter, opts: SandboxOptions) {
    this.reporter = reporter
  }
  async run(code: string, filetype: string, meta: any = {}) {
    let outputs: Output[] = []
    if (meta.runMode) {
      for (let line of code.split('\n')) {
        line = line.trimLeft()
        if (line.startsWith('$ ')) {
          line = line.slice(2)
        }
        outputs = outputs.concat(await exec(line, this.reporter))
      }
    }
    return { outputs, error: null, nodes: [] }
  }
}
