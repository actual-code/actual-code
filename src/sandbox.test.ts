import { createSandbox } from './sandbox'

describe('createSandbox', () => {
  test('non interactive', () => {
    const box = createSandbox()
    expect(box('const a = 1')).toEqual({ outputs: [], error: null })
  })

  test('continuas running', () => {
    const box = createSandbox()
    expect(box('const a = 1')).toEqual({ outputs: [], error: null })
    expect(box('console.log(a + 1)')).toEqual({
      outputs: [{ name: 'console.log', value: '2' }],
      error: null
    })
  })

  test('outputs', () => {
    const box = createSandbox()
    expect(
      box(
        'console.log(1); process.stdout.write("1"); process.stderr.write("2")'
      )
    ).toEqual({
      outputs: [
        { name: 'console.log', value: '1' },
        { name: 'stdout', value: Buffer.from('1') },
        { name: 'stderr', value: Buffer.from('2') }
      ],
      error: null
    })
  })

  test('error', () => {
    const box = createSandbox()
    const { error } = box('hoge')
    expect(typeof error).toBe('string')
    expect(error.length).toBeGreaterThan(0)
  })
})
