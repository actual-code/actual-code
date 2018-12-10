import unified from 'unified'
import stringify from 'remark-stringify'

import { run } from './run'

export const convert = (text: string) => {
  const { vfile } = run(text)
  const doc = unified()
    .use(stringify)
    .stringify(vfile)
  return doc
}
