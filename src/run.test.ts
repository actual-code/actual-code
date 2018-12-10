import { run } from './run'

test('run markdown', () => {
  const { results } = run('```js\nconsole.log("hoge")\n```\n')
  expect(results.length).toBe(1)
  const { outputs, start, end } = results[0]
  expect(outputs.length).toBe(1)
  expect(outputs[0]).toEqual({ name: 'console.log', value: 'hoge' })
  expect(start).toBe(0)
  expect(end).toBe(29)
})
