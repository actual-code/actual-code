import { execSync } from 'child_process'
import * as path from 'path'

import { eachPackages } from '@actual-code/build'

const install = async () => {
  await eachPackages(name => {
    console.log(`\x1b[36mpackage\x1b[m: ${name}`)
    execSync(`yarn`, { cwd: path.join('packages', name), stdio: 'inherit' })
  })
}

install()
