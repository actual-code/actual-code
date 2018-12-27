const _getTime = () => {
  const date = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`
}

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
  disableInfo: boolean
  disableLog: boolean
  disableDebug: boolean
  hash: string = null

  private _cb: ReporterCallback = () => {}

  constructor(opts: ReporterOptions = {}) {
    this.disableLog = !!opts.disableLog
    this.disableInfo = !!opts.disableInfo
    this.disableDebug = !!opts.disableDebug
  }

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
    if (!this.disableInfo) {
      process.stdout.write(
        `\x1b[32m[INFO] ${_getTime()}\x1b[m: ${event}${
          this.hash ? `.${this.hash}` : ''
        } ${message}\n`
      )
    }
    this._cb(event, this.hash, message)
  }

  async log(message: string) {
    if (!this.disableLog) {
      process.stdout.write(`\x1b[36m[LOG]  ${_getTime()}\x1b[m: ${message}\n`)
    }
    this._cb('log', this.hash, message)
  }

  async debug(message: string) {
    if (!this.disableDebug) {
      process.stdout.write(`\x1b[33m[DEBUG]${_getTime()}\x1b[m: ${message}\n`)
    }
    this._cb('debug', this.hash, message)
  }

  async output(filetype: string, data: string | Buffer) {
    switch (filetype) {
      case 'stdout': {
        process.stdout.write(data)
        break
      }
      case 'stderr': {
        process.stderr.write(data)
      }
    }
    this._cb(filetype, this.hash, data)
  }

  setCallback(cb: ReporterCallback) {
    this._cb = cb
  }
}
