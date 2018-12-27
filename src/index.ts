import { Reporter, ReporterOptions } from './reporter'
import { MDAST } from './source'

export interface SandboxOptions {
  rootPath?: string
  timeout?: number
  runMode?: boolean
  browser?: boolean
  file?: string
  // settings: { [props: string]: string }
}

export interface Sandbox {
  rootPath: string
  run: (
    code: string,
    hash: string,
    filetype: string,
    meta: SandboxOptions
  ) => Promise<boolean>
}

export interface Result {
  filetype: string
  data: string | Buffer
}

export interface Transformer {
  transform: (input: Result) => Promise<Result>
}

export interface Traverser {
  traverse: (node: MDAST.Node, isEnter: boolean) => Promise<void>
}

export type ActualCodePlugin = () => {
  name: string
  sandbox?: (reporter: Reporter, rootPath: string) => Promise<Sandbox>
  transformer?: () => Promise<Transformer>
  traverser?: () => Promise<Traverser>
}
