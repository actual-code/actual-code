import { convert } from '../convert'

const bootstrap = async () => {
  if (process.argv.length < 3) {
    console.log('usage actual-code <file.md>')
    process.exit(1)
  }
  const filename = process.argv[2]
  await convert(filename)
}

bootstrap()
