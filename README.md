# Markdown をスクリプトインタプリタ actual-code

- [#actual_code](https://twitter.com/search?f=tweets&q=%23actual_code)

Markdown はスクリプト言語です。何を言ってるかわからない？

Markdown にはコードブロックでさまざまなな言語を埋め込めます。なら、その言語を順次実行すれば、もうそれはシェルスクリプトなどと同じようなスクリプト言語と言っても過言ではありません！！

![Hello, World](images/hello-world.gif)

ちなみにこの理屈でいうと、任意のコードブロックを埋め込める言語ならなんでもスクリプト言語にできます。JSON でも Re:VIEW でも。

- Markdown のコードブロックを実際に Sandbox の中で走らせる

## install

```sh
npm i -g @actual-code/bin
```

```sh
npm i -D @actual-code/bin
```

```sh
yarn add -D @actual-code/bin
```

お好きなように

### markdown script

````markdown
#! /usr/bin/env actual-code

# script

```js
console.log('Hello, World!')
```
````

```sh
$ npm i -g @actual-code/bin
$ chmod +x script
$ ./script
Hello, World!
```

Markdown is Script Language!!!!!!!!!

## usage (GUI)

```sh
$ yarn
$ yarn build
$ bin/actual-code
```

手元に Chrome or Chromium がインストールされていれば GUI アプリが立ち上がります。一見よくある、Markdown リアルタイムプレビューアプリに見えますが、違うのは、コードブロックが実行されることです。

一応自動セーブ機能ありますが、バグがあって消えたりすることもあるかもしれません。

### markdown to markdown

```sh
bin/actual-code [-o outfile.md] <file.md>
```

# License

Copyright 2018 SASAKI Shunsuke <erukiti@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
