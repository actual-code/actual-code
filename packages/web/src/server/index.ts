import * as path from 'path'
import * as http from 'http'

import express from 'express'
import open from 'open'

export const serve = async (json: string, framePath: string) => {
  const app = express()
  app.use(express.static(path.join(__dirname, '..')))
  app.get('/index.json', (req, res) => {
    res.send(json)
  })
  app.use('/frame', express.static(framePath))
  const server = http.createServer(app)
  server.listen(0, () => {
    const addr = server.address()
    const port = typeof addr !== 'string' ? addr.port : addr
    const url = `http://localhost:${port}`
    open(url)
    console.log(`open ${url}`)
  })
}
