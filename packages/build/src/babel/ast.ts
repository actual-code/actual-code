import * as fs from 'fs'

import * as babel from '@babel/core'
import { ParserOptions } from '@babel/parser'
import { NodePath } from '@babel/traverse'
import { format, Options, CustomParser } from 'prettier'
import generate from '@babel/generator'

export const generateAst = async (
  filename: string,
  code: string,
  plugins: babel.PluginItem[] = []
) => {
  let nodePath: NodePath<babel.types.Program>

  const generateNodePath = (b: typeof babel) => {
    const visitor = {
      Program: n => {
        nodePath = n
      }
    }
    return { visitor }
  }

  const parserOpts: ParserOptions = {
    sourceFilename: filename,
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'objectRestSpread', 'classProperties']
  }

  const opts: babel.TransformOptions = {
    parserOpts,
    ast: true,
    code: true,
    babelrc: false,
    sourceType: 'module',
    plugins: [generateNodePath, ...plugins],
    sourceMaps: true
  }
  const { ast, map } = await babel.transformAsync(code, opts)
  return { ast, code, map, filename, nodePath }
}

export const generateCode = (ast: babel.types.Node) => {
  // console.log('generateCode')
  return generate(ast, { retainLines: true }).code
  // return format(generate(ast, { retainLines: true }).code, {
  //   parser: 'babylon',
  //   ...JSON.parse(fs.readFileSync('.prettierrc').toString())
  // })
}
