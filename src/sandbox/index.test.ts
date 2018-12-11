import { createSandbox } from '.'

const reporter = {
  info: () => {},
  stdout: process.stdout,
  stderr: process.stderr
}

describe('createSandbox', () => {
  test('non interactive', async () => {
    const box = createSandbox({}, reporter)
    expect(await box('const a = 1')).toEqual({ outputs: [], error: null })
  })

  test('continuas running', async () => {
    const box = createSandbox({}, reporter)
    expect(await box('const a = 1')).toEqual({ outputs: [], error: null })
    expect(await box('console.log(a + 1)')).toEqual({
      outputs: [{ name: 'console.log', value: '2' }],
      error: null
    })
  })

  test('outputs', async () => {
    const box = createSandbox({}, reporter)
    expect(
      await box(
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

  // test('error', () => {
  //   const box = createSandbox()
  //   const { error } = box('hoge')
  //   expect(typeof error).toBe('string')
  //   expect(error.length).toBeGreaterThan(0)
  // })
})
