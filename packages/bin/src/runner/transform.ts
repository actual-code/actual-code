import { TransformPlugin } from '@actual-code/core'

const getTime = () => {
  const date = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`
}

export const createTransform = (
  isVerbose: boolean
): TransformPlugin => async () => async ({
  type,
  subType,
  data,
  hash,
  payload,
}) => {
  switch (type) {
    case 'log': {
      if (isVerbose) {
        process.stdout.write(`\x1b[36m[LOG]  ${getTime()}\x1b[m: ${data}\n`)
      }
      return null
    }
    case 'debug': {
      if (isVerbose) {
        process.stdout.write(`\x1b[33m[DEBUG]${getTime()}\x1b[m: ${data}\n`)
      }
      return null
    }
    case 'event': {
      if (isVerbose) {
        process.stdout.write(
          `\x1b[32m[EVENT]${getTime()}\x1b[m: ${subType}${
            hash ? `.${hash}` : ''
          }${hash === data ? '' : ` ${data}`}\n`
        )
      }
      return null
    }
    case 'output': {
      if (subType === 'stdout') {
        process.stdout.write(data.toString())
      } else if (subType === 'stderr') {
        process.stderr.write(data.toString())
      }
      return { type, subType, data, hash, payload }
    }
  }
}
