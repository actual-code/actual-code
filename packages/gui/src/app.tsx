import React, { useEffect, useState } from 'react'

import Runner from './runner'
import Filelist from './filelist'

export default props => {
  const [filename, setFilename] = useState(null)
  console.log('filename', filename)

  const content = filename ? (
    <Runner filename={filename} setFilename={setFilename} />
  ) : (
    <Filelist setFilename={setFilename} />
  )

  return <>{content}</>
}
