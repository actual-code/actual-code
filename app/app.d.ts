import { ActualCode, ActualCodePlugin } from '../src/actual-code'
import { SandboxOptions } from '../src/actual-code/sandbox'
import { AppState } from '../src/storage'

interface Backend {
  initActualCode: (id: string) => Promise<ActualCode>
}

interface Carlo {
  loadParams: () => Promise<[Backend]>
  [props: string]: any
}

declare global {
  interface Window {
    getFileList: () => Promise<AppState[]>
    carlo: Carlo
    rpc
  }

  class ActualCode {
    registerPlugin(plugin: ActualCodePlugin | string): Promise<void>
    getAppState(): Promise<AppState>
    run(code: string, opts: SandboxOptions): Promise<any>
    save(code: string): Promise<void>
    waitFinished(): Promise<any>
  }
}
