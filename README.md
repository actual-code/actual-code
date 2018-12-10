# Markdown を実行できるツールを作ってみた

日々、技術的な徳を積んでいきたい erukiti です。ごきげんよう。[技術同人誌 Advent Calendar 2018](https://adventar.org/calendars/2877)の 10 日目です。もう夜になってしまいましたが、まだ 12/10 です！！！

## 今回作ったもの

Markdown のコードブロックの JavaScript/TypeScript を実行して、実行結果を Markdown に差し込むというツールです。今朝、アイデアを思いついたので、未完成にもほどがありますが、一応、この記事を書くのには十分動いています。

### モチベーション

僕がこれまでに技術書典で出してきた本は、すべて Re:VIEW で書いてきましたが、毎回サンプルコードの取り扱いがクッソかったるいです。

編集時にサンプルコードの取り扱いをミスって動かないコードになってしまうというのは、技術書執筆あるあるなのではないでしょうか？

そこで、Markdown に書いたコードブロックを実行するというアプローチです。これなら、やろうと思えば CI にテストを組み込むことも可能でしょう。

Jupyter Notebook とか Collaboratory とかが人気ですが、個人的には GUI が気にくわないし、VSCode で書きたいので、Markdown を実行するというアプローチを取りました。

次の技術書の執筆では、この仕組みを完成させて実運用したいと思っています。

### TypeScript

本記事は TypeScript で記述しています。TypeScript はとても楽です！

## JavaScript を実行する

[Node.js VM API](https://nodejs.org/api/vm.html) には、sandbox として使える命令があります。

`vm.createContext()`で、コンテキスト（要はグローバル変数）を作成してから `vm.runInContext()`でコードを実行します。

```ts
import * as vm from 'vm'

const sampleCtx: any = {
  require,
  setTimeout,
  setInterval,
  setImmediate,
  clearTimeout,
  clearInterval,
  clearImmediate,
  process,
  Buffer,
  console
}
vm.createContext(sampleCtx)
vm.runInContext('const a = 10', sampleCtx)
vm.runInContext('console.log(a)', sampleCtx)
vm.runInContext('process.stdout.write("stdout\\n")', sampleCtx)
```

    -- console.log
    10
    -- stdout
    stdout

`vm.runInContext('const a = 10', sampleCtx)`を実行したときにローカル変数である`a`を定義し、次の`vm.runInContext('console.log(a)', sampleCtx)`で引き続き同じスコープを使って、`a`を表示しています。

ただし、コンテキストとして`console`や`process`をそのまま渡すと色々不便なので、出力をトラップする仕組みを作ります。

まずは`process.stdout`と`process.stderr`を置き換えるための`WritableStream`を作ります。

```ts
import { Writable } from 'stream'

interface Output {
  name: string
  value: string
}

let outputs: Output[] = []
const createWritable = name => {
  return new Writable({ write: value => outputs.push({ name, value }) })
}
const stdout = createWritable('stdout')
const stderr = createWritable('stderr')
```

仕様としては、出力があれば`outputs` 配列に `Output` データを `push` します。

つぎは、`Proxy`を使って`process`の`stdout`と`stderr`を置き換えたオブジェクトを作成します。

```ts
const processProxy = new Proxy(process, {
  get: (target, name) => {
    switch (name) {
      case 'stdout':
        return stdout
      case 'stderr':
        return stderr
      default:
        return process[name]
    }
  }
})
```

同様に、`console`についても置き換えたオブジェクトを作成します。

```ts
const consoleProxy = new Proxy(console, {
  get: (target, name) => {
    if (!(name in console)) {
      return undefined
    }
    return (...args) => {
      outputs.push({
        name: `console.${name.toString()}`,
        value: args.join(' ')
      })
    }
  }
})
```

あらためて Sandbox を生成する関数を作ります。

```ts
import * as babel from '@babel/core'

const createSandbox = () => {
  const ctx: any = {
    require,
    setTimeout,
    setInterval,
    setImmediate,
    clearTimeout,
    clearInterval,
    clearImmediate,
    process: processProxy,
    Buffer,
    console: consoleProxy
  }
  vm.createContext(ctx)
  return (code: string, filetype: string = 'js') => {
    const compiled = babel.transformSync(code, {
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
      filename: `file.${filetype}`
    })
    outputs = []
    try {
      vm.runInContext(compiled.code, ctx)
    } catch (error) {
      return { outputs, error: error.toString() }
    }
    return { outputs, error: null }
  }
}
```

`createSandbox()`は、sandbox 内でコードを実行するための関数を返す関数です。

中身としては、まず Babel でコードを変換します。最近の Babel では、TypeScript も処理できるので、そのまま設定します。（ほんとは拡張子が`js`なら JS 向けという風にすべきかもしれない）

変換したコード `compiled.code`を実行し、出力結果やエラーを返します。

```ts
const testBox = createSandbox()

const testResult1 = testBox('const a: number = 1', 'ts')
console.log('outputs length:', testResult1.outputs.length)
console.log('outputs error:', !!testResult1.error)

const testResult2 = testBox('console.log(a + 1)', 'js')
console.log(
  testResult2.outputs
    .map(output => `${output.name}: ${output.value}`)
    .join('\n')
)
```

    -- console.log
    outputs length: 0
    -- console.log
    outputs error: false
    -- console.log
    console.log: 2

実際に Sandbox 関数を実行するとこのようになります。

## Markdown

Markdown パーサーには`remark`を使っています。

```ts
import remark from 'remark'
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import html from 'remark-html'

const { parse } = remark()
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(html)

console.log(JSON.stringify(parse('hoge'), null, '  '))
```

    -- console.log
    {
      "type": "root",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "value": "hoge",
              "position": {
                "start": {
                  "line": 1,
                  "column": 1,
                  "offset": 0
                },
                "end": {
                  "line": 1,
                  "column": 5,
                  "offset": 4
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 1,
              "offset": 0
            },
            "end": {
              "line": 1,
              "column": 5,
              "offset": 4
            },
            "indent": []
          }
        }
      ],
      "position": {
        "start": {
          "line": 1,
          "column": 1,
          "offset": 0
        },
        "end": {
          "line": 1,
          "column": 5,
          "offset": 4
        }
      }
    }

`remark`で`parse`すると、Markdown の AST が返ってきます。

AST はツリー構造なので再帰処理するための関数を作ります。

```ts
const traversal = (node, parent, cb, index = 0) => {
  cb(node, parent, index)
  ;(node.children || []).forEach((child, index) =>
    traversal(child, node, cb, index)
  )
}
```

ツリーに変更を加えられるようにするため、自分の親のノードや、インデックスの数字を引き渡す仕様にしました。

つぎに、エラーや Sanbox 実行時の出力から、コードブロック（remark のノード）を生成する関数を作成します。

```ts
const createErrorNode = value => ({ type: 'code', lang: 'error', value })
const createResultNode = outputs => ({
  type: 'code',
  value: outputs.map(({ name, value }) => `-- ${name}\n${value}`).join('\n')
})
```

実行できるファイルタイプを設定します。

```ts
const lang = {
  js: 'js',
  javascript: 'js',
  ts: 'ts',
  typescript: 'ts',
  jsx: 'jsx',
  tsx: 'tsx'
}
```

実際に Markdown の中から実行できるコードブロックを探し出して実行する関数です。

```ts
const run = (markdownText: string) => {
  const box = createSandbox()
  const vfile = remark.parse(markdownText)
  const nodes = []
  traversal(vfile, vfile, (node, parent, index) => {
    if (node.type === 'code') {
      const filetype = node.lang || 'js'
      const { outputs, error } = box(node.value, filetype)
      if (error) {
        nodes.push({ parent, index, node: createErrorNode(error) })
      } else if (outputs.length > 0) {
        nodes.push({ parent, index, node: createResultNode(outputs) })
      }
    }
  })

  nodes.reverse().forEach(({ parent, index, node }) => {
    parent.children = [
      ...parent.children.slice(0, index + 1),
      node,
      ...parent.children.slice(index + 1)
    ]
  })
  return { vfile }
}
```

最後の `nodes.reverse()` している部分は、生成したコードブロックを挿入するときに、インデックスがズレないようにするための小細工です。JavaScript では配列に挿入するメソッドがないので、スプレッド演算子と、`Array.slice`メソッドを駆使して挿入をしています。

返している`vfile`は、Remark（正確にはそれのベースである`unified`ライブラリ）でのトップレベルノードです。

## Markdown を実行して書き換えた Markdown を出力する

一通りのパーツがそろったので、実際に Markdown の中のコードブロックを実行して、Markdown を出力するコードです。

````ts
import unified from 'unified'
import stringify from 'remark-stringify'

import { run } from './run'

const convert = (text: string) => {
  const { results, vfile } = run(text)
  return unified()
    .use(stringify)
    .stringify(vfile)
}

let mdText = '```js\n'
mdText += 'const a = 1\n'
mdText += '```\n'
mdText += '`a`に`1`を設定します。\n'
mdText += '```js\n'
mdText += 'console.log(a)\n'
mdText += '```\n'
mdText += '`a`の中身を出力します。\n'

console.log(convert(mdText))
````

    -- console.log
    ```js
    const a = 1
    ```

    `a`に`1`を設定します。

    ```js
    console.log(a)
    ```

        -- console.log
        1

    `a`の中身を出力します。

## 最後に

ちなみにこの記事の Markdown は、実際に今回つくった actual-code で作成したものです。

### まとめ

- サンプルコードを確実にするためには、Markdown の中に直接コードを書いて、そのまま実行したい
- Node.js では VM API を使って実現できる（Jupyter の Node.js 向け kernel でも使われてるやりかた）
- Markdown パーサーには remark を使った

### ライセンス

ライセンスは MIT です。

### 今後

色々手を加えたいところはあります。

- 他の言語も実行できるようにする
- ブラウザ向けのコードを実行できるようにする
- 画像とかグラフとかいい感じに
- VSCode 拡張とか
- Re:VIEW コンバータとか

### リポジトリ

- <https://github.com/erukiti/actual-code>
