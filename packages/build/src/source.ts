import * as fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

import { BabelSource, createBabelSource } from './babel'

export interface BaseSource {
  readonly filename: string
  readonly code: string
  hash?: string
}

export type Source = BabelSource

export const createSource = async (filename: string): Promise<Source> => {
  const code = await readFile(filename, 'utf-8')
  const baseSource: BaseSource = {
    filename,
    code
  }
  return createBabelSource(baseSource)
}

export const generateSource = async (
  code: string,
  filename: string
): Promise<Source> => {
  const baseSource: BaseSource = {
    filename,
    code
  }
  return createBabelSource(baseSource)
}
