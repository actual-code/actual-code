export interface ReporterOptions {
  disableInfo?: boolean
  disableLog?: boolean
  disableDebug?: boolean
}

export type ReporterCallback = (
  type: string,
  hash: string,
  arg1: string | Buffer
) => void

export class Reporter {
  hash: string = null

  private _cbs: ReporterCallback[] = []

  info(event: 'read file', filename: string): Promise<void>
  info(event: 'write file', filename: string): Promise<void>
  info(event: 'sandbox run', codeHash: string): Promise<void>
  info(event: 'sandbox skip', codeHash: string): Promise<void>
  info(event: 'sandbox end', codeHash: string): Promise<void>
  info(event: 'register plugin', name: string): Promise<void>

  async info(event: string, message: string) {
    this._cbs.forEach(cb => cb(event, null, message))
  }

  async log(message: string) {
    this._cbs.forEach(cb => cb('log', null, message))
  }

  async debug(message: string) {
    this._cbs.forEach(cb => cb('debug', null, message))
  }

  async output(hash: string, filetype: string, data: string | Buffer) {
    this._cbs.forEach(cb => cb(filetype, hash, data))
  }

  addCallback(cb: ReporterCallback) {
    this._cbs.push(cb)
  }
}
