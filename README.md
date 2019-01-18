# Markdown スクリプトインタプリタ actual-code

![demo](images/demo.gif)

- [#actual_code](https://twitter.com/search?f=tweets&q=%23actual_code)

actual-code は Markdown のコードブロックをそれぞれの言語のソースコードと見なして実行するインタプリタです。JavaScript のコードブロックであれば Node.js で実行し、shell のコードブロックであればシェルスクリプトとみなして実行します。

Chrome か Chromium をインストールしていれば、GUI アプリとして動作します。

## 注意: α バージョンです

開発中の α バージョンであり、まだ安定していません。内部の API や仕組み、操作方法などが変わる可能性があります。

現時点では、HTML, JavaScript, Shell script にのみ対応しています。

## Install

```sh
$ npm i -g @actual-code/bin
```

## Usage (CLI)

```sh
$ actual-code [-o output file] <script file>
```

指定した script file を実行し結果を表示します。-o オプションで、実行結果を挿入した Markdown を出力します。

## Usage (shbang)

````markdown
#! /usr/bin/env actual-code

# script

```js
console.log('Hello, World!')
```
````

```sh
$ chmod +x script
$ ./script
Hello, World!
```

Markdown is Script Language!!!!!!!!!

## usage (GUI)

```sh
$ actual-code
```

手元に Chrome or Chromium がインストールされていれば GUI アプリが立ち上がります。一見よくある、Markdown リアルタイムプレビューアプリに見えますが、違うのは、コードブロックが実行されることです。

一応自動セーブ機能ありますが、バグがあって消えたりすることもあるかもしれません。

## License

Copyright 2018-2019 SASAKI Shunsuke <erukiti@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
