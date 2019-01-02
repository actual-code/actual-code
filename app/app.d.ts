import { ActualCode, ActualCodePlugin } from '../src/actual-code'
import { SandboxOptions } from '../src/actual-code/sandbox'
import { AppState } from '../src/storage'
import { Reporter } from '../src/reporter'
import { CodeBlock } from '../src/source'
import { stringifyHtml, MDAST } from '../src/source/unified'

interface Backend {
  initActualCode: (id: string) => Promise<ActualCode>
}

interface Carlo {
  loadParams: () => Promise<[Reporter, Backend]>
  [props: string]: any
}

declare global {
  interface Window {
    stringifyHtml: typeof stringifyHtml
    getFileList: () => Promise<AppState[]>
    carlo: Carlo
    rpc
  }

  class ActualCode {
    constructor(id: number, reporter: Reporter)
    registerPlugin(plugin: ActualCodePlugin | string): Promise<void>
    getAppState(): Promise<AppState>
    run(
      code: string,
      opts: SandboxOptions
    ): Promise<{ settings: any; node: MDAST.Root; codeBlocks: CodeBlock[] }>
    save(code: string): Promise<void>
  }
}
