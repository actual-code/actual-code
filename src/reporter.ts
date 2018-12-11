const _getTime = () => {
  const date = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`
}
export class Reporter {
  info(message: string) {
    console.log(`\x1b[32m[INFO] ${_getTime()}\x1b[m: ${message}`)
  }

  get stdout() {
    return process.stdout
  }

  get stderr() {
    return process.stderr
  }
}
