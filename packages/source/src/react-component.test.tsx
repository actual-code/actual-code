import React from 'react'

import { compiler } from './react-component'
import { parseMarkdown } from './markdown'

const md = (text: string) => compiler(parseMarkdown(text))

test('', () => {
  expect(md('')).toEqual(<></>)
})

test('', () => {
  expect(md('# hoge\n')).toEqual(
    <>
      <h1>hoge</h1>
    </>
  )
})

test('', () => {
  expect(md('hoge\n\n')).toEqual(
    <>
      <p>hoge</p>
    </>
  )
})

test('', () => {
  expect(md('`hoge`')).toEqual(
    <>
      <p>
        <code>hoge</code>
      </p>
    </>
  )
})

test('', () => {
  expect(md('[hoge](url)')).toEqual(
    <>
      <p>
        <a href="url">hoge</a>
      </p>
    </>
  )
})

test('', () => {
  expect(md('* hoge')).toEqual(
    <>
      <ul>
        <li>
          <p>hoge</p>
        </li>
      </ul>
    </>
  )
})

test('', () => {
  expect(md('----')).toEqual(
    <>
      <hr />
    </>
  )
})

test('', () => {
  expect(md('> hoge')).toEqual(
    <>
      <blockquote>
        <p>hoge</p>
      </blockquote>
    </>
  )
})

test('', () => {
  expect(md('th1|th2\n----|----\nhoge|fuga\n')).toEqual(
    <>
      <table>
        <tr>
          <td>th1</td>
          <td>th2</td>
        </tr>
        <tr>
          <td>hoge</td>
          <td>fuga</td>
        </tr>
      </table>
    </>
  )
})

test('', () => {
  expect(md('---\nhoge: 1\n---\n')).toEqual(<></>)
})

test('', () => {
  expect(md('```js\nconsole.log(1)\n```\n')).toEqual(
    <>
      <pre>console.log(1)</pre>
    </>
  )
})

test('', () => {
  expect(md('*hoge*_fuga_')).toEqual(
    <>
      <p>
        <em>hoge</em>
        <em>fuga</em>
      </p>
    </>
  )
})

test('', () => {
  expect(md('**hoge**__fuga__')).toEqual(
    <>
      <p>
        <strong>hoge</strong>
        <strong>fuga</strong>
      </p>
    </>
  )
})

test('', () => {
  expect(md('<iframe src="hoge"></iframe>\n')).toEqual(
    <>
      <iframe src="hoge" />
    </>
  )
})
