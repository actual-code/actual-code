import { Output } from '.'

export type ReporterCallback = (report: Output) => void

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
    this._cb({ type: 'log', payload: message })
  }

  async debug(message: string) {
    this._cb({ type: 'debug', payload: message })
  }

  async output(hash: string, filetype: string, payload: any) {
    this._cb({ type: 'output', subType: filetype, hash, payload })
  }

  setCallback(cb: ReporterCallback) {
    this._cb = cb
  }
}
