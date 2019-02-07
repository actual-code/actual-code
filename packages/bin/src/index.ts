import arg from 'arg'

import { runner } from './runner'

import { version } from '../package.json'

const bootstrap = async () => {
  const args = arg({
    '--output': String,
    '--convert': String,
    '--verbose': Boolean,
    '--version': Boolean,
    '--help': Boolean,

    '-o': '--output',
    '-v': '--version',
  })

  if (args['--version']) {
    process.stdout.write(`${version}\n`)
    process.exit(0)
  }

  if (args['--help'] || args._.length === 0) {
    const message = `usage actual-code [-o output.json] <file.md>\n`
    process.stdout.write(message)
    process.exit(1)
  }

  const params = {
    isVerbose: args['--verbose'],
    output: args['--output'],
    convert: args['--convert'],
  }

  await runner(args._[0], params)
}

bootstrap()
