import { createHash } from 'crypto'

export const getHash = (data: string | Buffer) => {
  const sha256 = createHash('sha256')
  sha256.write(data)
  return sha256.digest().toString('hex')
}
