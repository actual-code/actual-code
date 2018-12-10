import * as fs from 'fs'
import { promisify } from 'util'

import { convert } from '../convert'

const readFile = promisify(fs.readFile)

const bootstrap = async () => {
  if (process.argv.length < 3) {
    console.log('usage actual-code <file.md>')
    process.exit(1)
  }
  const filename = process.argv[2]
  const text = (await readFile(filename)).toString()
  const converted = await convert(text)
  process.stdout.write(converted)
  process.stdout.write('\n')
}

bootstrap()
