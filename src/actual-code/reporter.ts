export interface Report {
  type: 'output' | 'event' | 'log' | 'debug'
  subType?: string
  hash?: string
  data?: string | Buffer
  payload?: any
}

export type ReporterCallback = (report: Report) => void

export class Reporter {
  private _cb: ReporterCallback = () => {}

  event(event: 'read file', payload: { filename: string }): Promise<void>
  event(event: 'write file', payload: { filename: string }): Promise<void>
  event(event: 'sandbox run', payload: { hash: string }): Promise<void>
  event(event: 'sandbox skip', payload: { hash: string }): Promise<void>
  event(event: 'sandbox end', payload: { hash: string }): Promise<void>
  event(event: 'register plugin', payload: { name: string }): Promise<void>

  async event(event: string, payload: any) {
    this._cb({ type: 'event', subType: event, payload })
  }

  async log(message: string) {
    this._cb({ type: 'log', data: message })
  }

  async debug(message: string) {
    this._cb({ type: 'debug', data: message })
  }

  async output(hash: string, filetype: string, data: string | Buffer) {
    this._cb({ type: 'output', subType: filetype, hash, data })
  }

  setCallback(cb: ReporterCallback) {
    this._cb = cb
  }
}
