import arg from 'arg'

import { convert } from './convert'
import { bootGui } from './gui'

import { version } from '../../package.json'

const bootstrap = async () => {
  const args = arg({
    '--output': String,
    '--verbose': Boolean,
    '--quiet': Boolean,
    '--version': Boolean,
    '--help': Boolean,

    '-o': '--output',
    '-v': '--version'
  })

  const usage = () => {
    process.stdout.write('usage actual-code [-o outputfile] [file.md]\n')
    process.exit(1)
  }

  if (args['--version']) {
    process.stdout.write(`${version}\n`)
    return
  }

  if (args['--help']) {
    usage()
  }

  const reporterOpts = {
    isVerbose: args['--verbose']
  }

  if (args._.length === 0) {
    bootGui(reporterOpts)
  } else {
    await convert(args._[0], reporterOpts, args['--output'])
  }
}

bootstrap()
