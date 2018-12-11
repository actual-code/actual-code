import childProcess from 'child_process'

import { Output, SandboxOptions } from '.'

export const createShellSandbox = (opts: SandboxOptions) => {
  return async (code: string, filetype: string, opts2: any = {}) => {
    const outputs: Output[] = []
    code.split('\n').forEach(line => {
      line = line.trimLeft()
      if (line.startsWith('$ ')) {
        line = line.slice(2)
      }
      // shell escape
      // stderr > stdout
      try {
        const cmd = `${line} 2>&1`
        const value = childProcess.execSync(cmd).toString('utf-8')
        outputs.push({ name: line, value })
      } catch (error) {
        console.error(error)
        return { outputs, error }
      }
    })
    return { outputs, error: null }
  }
}
