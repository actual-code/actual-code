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

* 0.1.0
  - [ ] NEWボタン
  - [ ] 描画綺麗に

## DONE

- [x] 毎回 Sandbox 作る、大富豪プログラムを修正する
- [x] {browser} メタタグで、Node.js上じゃなくて、ブラウザ上で動くようにする
- [x] carlo appで、実行ボタンと自動実行on/offスイッチ
- [x] コードをすこーし、綺麗にした
- [x] browser sandbox（parcel-bundler + iframe）
- [x] carlo app での自動実行を禁止、RUN ボタンを追加
- [x] carlo app のコードをあらかじめビルドするように変更
- [x] Markdownの自動保存
- [x] RUNキャッシュ
