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

  setHash(hash: string) {
    this.hash = hash
  }

  info(event: 'read file', filename: string): Promise<void>
  info(event: 'write file', filename: string): Promise<void>
  info(event: 'sandbox run', codeHash: string): Promise<void>
  info(event: 'sandbox skip', codeHash: string): Promise<void>
  info(event: 'sandbox end', codeHash: string): Promise<void>
  info(event: 'register plugin', name: string): Promise<void>

  async info(event: string, message: string) {
    this._cbs.forEach(cb => cb(event, this.hash, message))
    switch (event) {
      case 'sandbox end': {
        this.hash = null
        break
      }
      case 'sandbox run': {
        this.hash = message
        break
      }
    }
  }

  async log(message: string) {
    this._cbs.forEach(cb => cb('log', this.hash, message))
  }

  async debug(message: string) {
    this._cbs.forEach(cb => cb('debug', this.hash, message))
  }

  async output(hash: string, filetype: string, data: string | Buffer) {
    this._cbs.forEach(cb => cb(filetype, hash, data))
  }

  addCallback(cb: ReporterCallback) {
    this._cbs.push(cb)
  }
}
