# 実際に動く Markdown

Markdown はスクリプト言語です。何を言ってるかわからない？

Markdown にはコードブロックでさまざまなな言語を埋め込めます。なら、その言語を順次実行すれば、もうそれはシェルスクリプトなどと同じようなスクリプト言語と言っても過言ではありません！！

- Markdown のコードブロックを実際に Sandbox の中で走らせる

## usage (GUI)

```sh
$ yarn
$ yarn build
$ bin/actual-code
```

手元に Chrome or Chromium がインストールされていれば GUI アプリが立ち上がります。一見よくある、Markdown リアルタイムプレビューアプリに見えますが、違うのは、コードブロックが実行されることです。

### markdown to markdown

```sh
bin/actual-code [-o outfile.md] <file.md>
```

## TODO

* carlo app
  - carlo app でリアルタイム実行は危険…かも
  - [ ] cache directory改善
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
- [x] carlo appで、実行ボタンと自動実行on/offスイッチ
- [x] コードをすこーし、綺麗にした
- [x] browser sandbox（parcel-bundler + iframe）
- [x] carlo app での自動実行を禁止、RUN ボタンを追加
