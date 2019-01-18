import { createHash } from 'crypto'

export const sha256 = (data: string | Buffer) => {
  const hash = createHash('sha256')
  hash.write(data)
  return hash.digest().toString('hex')
}
