import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import unified from 'unified'

import { parseMarkdown } from '../src/unified'
import reviewPlugin from '../src/review'

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

const review = unified().use(reviewPlugin)

const test = async () => {
  const files = await readDir('./test')
  await Promise.all(
    files
      .filter(file => file.endsWith('.md'))
      .map(async file => {
        const src = path.join('test', file)
        const dest = src.replace(/\.md$/, '.re')

        const sourceContent = await readFile(src, { encoding: 'utf-8' })
        const expected = await readFile(dest, { encoding: 'utf-8' })
        const tree = parseMarkdown(sourceContent)
        const compiled = review.stringify(tree)
        if (expected.trim() === compiled.trim()) {
          console.log('.')
        } else {
          console.log(`Error: ${file}`)
          console.log(tree)
          console.log(compiled)
          process.exit(1)
        }
      })
  )
}

test()
