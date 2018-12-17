const arg = require('arg')

import { convert } from '../convert'
import { bootGui } from '../gui'

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

  console.log(args)

  const usage = () => {
    console.log('usage actual-code [-o outputfile] [file.md]')
    process.exit(1)
  }

  if (args['--version']) {
    console.log(version)
    return
  }

  if (args['--help']) {
    usage()
  }

  const reporterOpts = {
    disableInfo: !!args['--quiet'],
    disableLog: !args['--verbose'],
    disableDebug: !args['--verbose']
  }

  if (args._.length === 0) {
    bootGui(reporterOpts)
  } else {
    await convert(args._[0], reporterOpts, args['--output'])
  }
}

bootstrap()
