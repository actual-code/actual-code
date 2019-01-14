import { writeBlob, listBlobs, readBlob } from './blob'

const fs = require('fs')
const writeFileAtomic = require('write-file-atomic')

jest.mock('fs')
jest.mock('write-file-atomic')

beforeEach(() => {
  jest.resetAllMocks()
})

const hash = '4c716d4cf211c7b7d2f3233c941771ad0507ea5bacf93b492766aa41ae9f720d'
const content = 'hogehoge'

describe('writeBlob', () => {
  test('data is string', async () => {
    writeFileAtomic.sync.mockImplementation((name, data, opt) => {
      expect(name).toBe(`/hoge/blob/${hash}.md`)
      expect(data).toBe(content)
      expect(opt).toEqual({ encoding: 'utf-8' })
    })
    expect(await writeBlob('/hoge', content, '.md')).toEqual(hash)
    expect(writeFileAtomic.sync.mock.calls.length).toBe(1)
  })

  test('data is Buffer', async () => {
    const hash =
      '4c716d4cf211c7b7d2f3233c941771ad0507ea5bacf93b492766aa41ae9f720d'

    writeFileAtomic.sync.mockImplementation((name, data, opt) => {
      expect(name).toBe(`/hoge/blob/${hash}.md`)
      expect(data).toEqual(Buffer.from(content))
      expect(opt).toEqual({})
    })
    expect(await writeBlob('/hoge', Buffer.from(content), '.md')).toEqual(hash)
    expect(writeFileAtomic.sync.mock.calls.length).toBe(1)
  })
})

test('listBlobs', async () => {
  fs.readdir.mockImplementation((dir, cb) => {
    expect(dir).toBe('/hoge/blob')
    cb(null, ['fuga.md', 'piyo.json'])
  })
  const res = await listBlobs('/hoge', 'md')
  expect(Array.isArray(res)).toBeTruthy()
  expect(res.length).toBe(1)
  expect(res[0]).toBe('fuga')
  expect(fs.readdir.mock.calls.length).toBe(1)
})

describe('readBlob', () => {
  test('file exists', async () => {
    fs.readdir.mockImplementation((dir, cb) => {
      expect(dir).toBe('/hoge/blob')
      cb(null, [`${hash}.md`, 'piyo.json'])
    })
    fs.readFile.mockImplementation((filename, cb) => {
      expect(filename).toBe(`${hash}.md`)
      cb(null, content)
    })
    await expect(readBlob('/hoge', hash)).resolves.toBe(content)
    expect(fs.readdir.mock.calls.length).toBe(1)
    expect(fs.readFile.mock.calls.length).toBe(1)
  })

  test('file not exists', async () => {
    fs.readdir.mockImplementation((dir, cb) => {
      expect(dir).toBe('/hoge/blob')
      cb(null, ['piyo.json'])
    })
    await expect(readBlob('/hoge', hash)).rejects.toThrowError('FILE NOT FOUND')
    expect(fs.readdir.mock.calls.length).toBe(1)
  })

  test('hash is invalid', async () => {
    fs.readdir.mockImplementation((dir, cb) => {
      expect(dir).toBe('/hoge/blob')
      cb(null, ['hoge.md', 'piyo.json'])
    })
    fs.readFile.mockImplementation((filename, cb) => {
      expect(filename).toBe(`hoge.md`)
      cb(null, content)
    })
    await expect(readBlob('/hoge', 'hoge')).rejects.toThrowError(
      'HASH IS INVALID'
    )
    expect(fs.readdir.mock.calls.length).toBe(1)
    expect(fs.readFile.mock.calls.length).toBe(1)
  })
})
