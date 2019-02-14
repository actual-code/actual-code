import * as path from 'path'

import { createBuiler } from '@actual-code/build'

const watch = async () => {
  const builder = createBuiler({ nodeEnv: 'development' })
  builder.addProject('source')
  builder.addProject('core')
  builder.addProject('bin')
  builder.addProject('web', {
    sourceMatch: ['src/server/**/*.ts'],
    entrypoints: [
      path.resolve('packages', 'web', 'src', 'browser', 'index.html'),
    ],
  })
  await builder.watch()
}

watch()
