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
): TransformPlugin => async () => async ({ type, subType, hash, payload }) => {
  switch (type) {
    case 'log': {
      if (isVerbose) {
        process.stdout.write(`\x1b[36m[LOG]  ${getTime()}\x1b[m: ${payload}\n`)
      }
      return null
    }
    case 'debug': {
      if (isVerbose) {
        process.stdout.write(`\x1b[33m[DEBUG]${getTime()}\x1b[m: ${payload}\n`)
      }
      return null
    }
    case 'event': {
      if (isVerbose) {
        process.stdout.write(
          `\x1b[32m[EVENT]${getTime()}\x1b[m: ${subType}${
            hash ? `.${hash}` : ''
          }\n`
        )
      }
      return null
    }
    case 'output': {
      if (subType === 'stdout') {
        process.stdout.write(payload.toString())
      } else if (subType === 'stderr') {
        process.stderr.write(payload.toString())
      }
      return { type, subType, hash, payload }
    }
  }
}
