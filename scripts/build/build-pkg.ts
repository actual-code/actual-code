import * as path from 'path'

import { exec } from 'pkg'

const createArgs = (os: string, arch: string, script: string) => {
  return [
    script,
    '--targets',
    `node10-${os}-${arch}`,
    '--out-path',
    path.join('build', `${os}-${arch}`)
  ]
}

export const buildPkg = async () => {
  const settings = [
    createArgs('macos', 'x64', path.join('bin', 'actual-code')),
    createArgs('linux', 'x64', path.join('bin', 'actual-code')),
    createArgs('win', 'x64', path.join('bin', 'actual-code'))
  ]
  for (const setting of settings) {
    await exec(setting)
  }
}
