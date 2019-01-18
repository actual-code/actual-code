import * as path from 'path'

import { createBuiler } from '@actual-code/build'

const watch = async () => {
  const builder = createBuiler({ nodeEnv: 'development' })
  builder.addProject('source')
  builder.addProject('core')
  builder.addProject('bin')
  builder.addProject('gui', {
    sourceMatch: [],
    entrypoints: [path.resolve('packages', 'gui', 'src', 'index.html')],
  })
  await builder.watch()
}

watch()
