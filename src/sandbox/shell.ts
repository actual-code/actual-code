import childProcess from 'child_process'

import { Output, SandboxOptions } from '.'
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

export const createShellSandbox = (
  reporter: Reporter,
  opts: SandboxOptions
) => {
  return async (code: string, filetype: string, opts2: any = {}) => {
    let outputs: Output[] = []
    for (let line of code.split('\n')) {
      line = line.trimLeft()
      if (line.startsWith('$ ')) {
        line = line.slice(2)
      }
      outputs = outputs.concat(await exec(line, reporter))
    }
    return { outputs, error: null }
  }
}
