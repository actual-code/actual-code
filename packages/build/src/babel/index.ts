import * as babel from '@babel/core'
import { NodePath } from '@babel/traverse'

import { generateAst, generateCode } from './ast'
import { BaseSource } from '../source'
import { getHash } from '../utils'

export class BabelSource implements BaseSource {
  filename: string

  babel: typeof babel = babel
  private _ast: babel.types.Node
  private _originalCode: string
  private _nodePath: NodePath<babel.types.Program>

  private _init: Promise<void>

  constructor(baseSource: BaseSource) {
    this.filename = baseSource.filename
    const init = async () => {
      const res = await generateAst(baseSource.filename, baseSource.code)
      this._originalCode = generateCode(res.ast)
      this._ast = res.ast
      this._nodePath = res.nodePath
    }
    this._init = init()
  }

  ready() {
    return this._init
  }

  isDirty() {
    const code = generateCode(this._ast)
    return code !== this._originalCode
  }

  get code() {
    return generateCode(this._ast)
  }

  get hash() {
    return getHash(this.code)
  }

  get ast() {
    return this._ast
  }

  async update(code: string) {
    const res = await generateAst(this.filename, code)
    this._originalCode = generateCode(res.ast)
    this._ast = res.ast
    this._nodePath = res.nodePath
  }

  async updateAst(ast: babel.types.Node) {
    this._ast = ast
    // this._nodePath = gen
    // FIXME
  }
  getNodePath(p: string) {
    return this._nodePath.get(p)
  }

  getAst(p: string) {
    const node = this._nodePath.get(p)
    if (Array.isArray(node)) {
      return node.map(nodePath => nodePath.node)
    } else {
      return node.node
    }
  }
}

export const createBabelSource = async (
  baseSource: BaseSource
): Promise<BabelSource> => {
  const source = new BabelSource(baseSource)
  await source.ready()
  return source
}
