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

export interface Reporter {
  info(message: string): Promise<void>
  log(message: string): Promise<void>
  debug(message: string): Promise<void>

  writeStdout(data: string | Buffer): Promise<void>
  writeStderr(data: string | Buffer): Promise<void>
}

export class ConsoleReporter implements Reporter {
  disableInfo: boolean
  disableLog: boolean
  disableDebug: boolean

  constructor(opts: ReporterOptions = {}) {
    this.disableLog = !!opts.disableLog
    this.disableInfo = !!opts.disableInfo
    this.disableDebug = !!opts.disableDebug
  }

  async info(message: string) {
    if (!this.disableInfo) {
      process.stdout.write(`\x1b[32m[INFO] ${_getTime()}\x1b[m: ${message}\n`)
    }
  }

  async log(message: string) {
    if (!this.disableLog) {
      process.stdout.write(`\x1b[36m[LOG]  ${_getTime()}\x1b[m: ${message}\n`)
    }
  }

  async debug(message: string) {
    if (!this.disableDebug) {
      process.stdout.write(`\x1b[33m[DEBUG]${_getTime()}\x1b[m: ${message}\n`)
    }
  }

  async writeStdout(data: string | Buffer) {
    process.stdout.write(data)
  }

  async writeStderr(data: string | Buffer) {
    process.stderr.write(data)
  }
}
