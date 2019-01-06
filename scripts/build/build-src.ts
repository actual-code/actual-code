const globby = require('globby')

import { transpile } from './transpile'
import { Source, createSource } from './source'

export const buildSrc = async (entry: string) => {
  const entries = await globby([entry, '!.test.ts', '!.d.ts'])
  console.log(entries)
  await Promise.all(
    entries.map(async name => {
      const source = await createSource(name)
      const dest = name.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js')
      await transpile(source, dest)
      console.log('compile', name, dest)
    })
  )
}
