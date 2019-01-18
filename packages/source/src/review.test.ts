import unified from 'unified'
import reviewPlugin from './review'
import { parseMarkdown } from './unified'

const review = unified().use(reviewPlugin)
const mdToReview = (src: string) => review.stringify(parseMarkdown(src))

describe('heading', () => {
  test('standard heading', async () => {
    expect(mdToReview(`# hoge`)).toBe(`= hoge`)
    expect(mdToReview(`## fuga`)).toBe(`== fuga`)
  })

  test('with option', () => {
    expect(mdToReview(`### [column] コラム`)).toBe(`===[column] コラム`)
  })
})

describe('paragraph', () => {
  test('inline code', () => {
    expect(mdToReview('ほげは`hoge`です')).toBe(`\nほげは@<code>{hoge}です\n`)
  })

  test('', () => {
    expect(mdToReview('ほげ\n')).toBe('\nほげ\n')
    expect(mdToReview('ほげ\nほげ\n')).toBe('\nほげ\nほげ\n')
    expect(mdToReview('ほげ\n\nふが')).toBe('\nほげ\n\nふが\n')
  })

  test('link', () => {
    expect(mdToReview('[ほげ](http://example.com)')).toBe(
      '\n@<href>{http://example.com, ほげ}\n'
    )
  })
})

describe('code block', () => {
  test('no lang', () => {
    expect(mdToReview('```\nほげ\n```\n')).toBe('//listnum[][]{\nほげ\n//}')
  })
  test('lang', () => {
    expect(mdToReview('```js\nconst a = 1\n```\n')).toBe(
      '//listnum[][][js]{\nconst a = 1\n//}'
    )
  })
})

describe('list', () => {
  test('', () => {
    expect(mdToReview('* hoge\n* fuga')).toBe(' * hoge\n * fuga\n')
    expect(mdToReview('* hoge\n  - fuga')).toBe(' * hoge\n ** fuga\n')
  })
})
