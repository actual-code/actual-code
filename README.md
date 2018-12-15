# 実際に動く Markdown

Markdown はスクリプト言語です。何を言ってるかわからない？

Markdown にはコードブロックでさまざまなな言語を埋め込めます。なら、その言語を順次実行すれば、もうそれはシェルスクリプトなどと同じようなスクリプト言語と言っても過言ではありません！！

- Markdown のコードブロックを実際に Sandbox の中で走らせる

## usage

```sh
$ yarn
$ yarn build
$ bin/actual-code
```

手元に Chrome or Chromium がインストールされていれば GUI アプリが立ち上がります。一見よくある、Markdown リアルタイムプレビューアプリに見えますが、違うのは、コードブロックが実行されることです。

## TODO

* carlo app
  - [x] 全体に、実行ボタンと自動実行on/offスイッチ
  - [ ] コードブロックごとに、実行ボタンと自動実行on/offスイッチ
- browser sandbox
  - webview を試す
  - iframe?????
- [ ] Sandbox を登録する仕組みにする
- コードブロックの lang、拡張子などの対応付けとかどうするか？
  - [ ] npm actual-code で sandbox class を登録する
  - [ ] frontmatter で、markdown import
  - [ ] JS vm sandbox で、エラースタックをいい感じにいじる
* リファクタリング！
* [ ] エラー周りのユニットテストとかを書く
* [ ] e2e テスト（入力の Markdown と、出力ファイルやレポートなどのテスト）
- [ ] pkg で生の actual-code バイナリを生成する
  - 問題はどこにアップロードするのか？github の リリースバイナリ？
- puppeteer sandbox
- Docker sandbox
- VirtualBox sandbox
- 図のsandbox
- シェルスクリプト
  - #! /bin/sh か /bin/bash で始まってたらシェルスクリプトとして動かす？
- 実行結果を加工できるようにする
  - 画像

## DONE

- [x] 毎回 Sandbox 作る、大富豪プログラムを修正する
- [x] {browser} メタタグで、Node.js上じゃなくて、ブラウザ上で動くようにする
