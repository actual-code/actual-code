const fs = { ...require('fs'), writeFile: jest.fn() }
jest.setMock('fs', fs)

import { run, parseMeta } from './run'

test('parseMeta', () => {
  expect(parseMeta(null)).toEqual({})
  expect(parseMeta('')).toEqual({})
  expect(parseMeta('k')).toEqual({})
  expect(parseMeta('{k')).toEqual({})
  expect(parseMeta('k}')).toEqual({})
  expect(parseMeta('{key}')).toEqual({ key: true })
  expect(parseMeta('{key=1}')).toEqual({ key: '1' })
  expect(parseMeta('{k="{v} {v}"}')).toEqual({ k: '{v} {v}' })
  expect(parseMeta('{a b}')).toEqual({ a: true, b: true })
  expect(parseMeta('{alice bob=1 carol="{hoge} {fuga}"}')).toEqual({
    alice: true,
    bob: '1',
    carol: '{hoge} {fuga}'
  })
})

const strip = node => {
  const res: any = {}
  Object.keys(node).forEach(key => {
    if (key === 'position' || !node[key]) {
      return
    }

    if (key === 'children') {
      res.children = node.children.map(child => strip(child))
    } else {
      res[key] = node[key]
    }
  })
  return res
}

const reporter = {
  info: () => {},
  stdout: process.stdout,
  stderr: process.stderr
}

describe('run markdown', () => {
  test('run', async () => {
    const { results, vfile } = await run(
      '# hoge\n\n```js\nconsole.log("hoge")\n```\n',
      { settings: {} },
      reporter
    )
    expect(results.length).toBe(1)
    const { outputs, start, end } = results[0]
    expect(outputs.length).toBe(1)
    expect(outputs[0]).toEqual({ name: 'console.log', value: "'hoge'" })
    expect(start).toBe(8)
    expect(end).toBe(37)
    expect(strip(vfile)).toEqual({
      children: [
        {
          children: [{ type: 'text', value: 'hoge' }],
          depth: 1,
          type: 'heading'
        },
        { lang: 'js', type: 'code', value: 'console.log("hoge")' },
        { type: 'code', value: "-- console.log\n'hoge'" }
      ],
      type: 'root'
    })
  })

  test('quiet mode', async () => {
    const { results, vfile } = await run(
      '```js {quiet}\nconsole.log("hoge")\n```\n',
      { settings: {} },
      reporter
    )
    expect(results.length).toBe(1)
    const { outputs, start, end } = results[0]
    expect(outputs.length).toBe(1)
    expect(outputs[0]).toEqual({ name: 'console.log', value: "'hoge'" })
    expect(start).toBe(0)
    expect(end).toBe(37)
    expect(strip(vfile)).toEqual({
      children: [
        {
          lang: 'js',
          meta: '{quiet}',
          type: 'code',
          value: 'console.log("hoge")'
        }
      ],
      type: 'root'
    })
  })

  test('write file', async () => {
    jest.resetAllMocks()
    fs.writeFile.mockImplementation((filename, content, cb) => {
      expect(filename).toBe('hoge.js')
      expect(content).toBe(`console.log("hoge")`)
      cb(null)
    })

    const { results, vfile } = await run(
      '```js {file="hoge.js"}\nconsole.log("hoge")\n```\n',
      { settings: {} },
      reporter
    )
    expect(results.length).toBe(1)
    const { outputs, start, end } = results[0]
    expect(outputs.length).toBe(1)
    expect(outputs[0]).toEqual({ name: 'console.log', value: "'hoge'" })
    expect(strip(vfile)).toEqual({
      children: [
        {
          lang: 'js',
          type: 'code',
          meta: '{file="hoge.js"}',
          value: 'console.log("hoge")'
        },
        { type: 'code', value: "-- console.log\n'hoge'" }
      ],
      type: 'root'
    })
    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })
})
