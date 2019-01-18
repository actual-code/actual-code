import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

import * as mkdirp from 'mkdirp'

import { Source } from './source'

export const transpile = async (source: Source, dest: string) => {
  await source.ready()
  const res = await source.babel.transformFromAstAsync(
    source.ast,
    source.code,
    {
      ast: true,
      filename: source.filename,
      presets: [
        require('@babel/preset-typescript'),
        [require('@babel/preset-env'), { targets: { node: '10' } }]
      ],
      plugins: [
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-object-rest-spread')
      ]
    }
  )
  await source.updateAst(res.ast)
  mkdirp.sync(path.dirname(dest))
  await writeFile(dest, source.code)
}
