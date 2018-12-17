# shell script!

## 逐次実行

```sh
$ pwd
$ ls -al
```

## シェルスクリプト

先頭に、`#!` をつけてるとシェルスクリプトとして一括実行します。

```sh
#! /bin/sh
cat >love.txt <<EOF
I love JavaScript!
EOF
```

```sh
$ cat love.txt
```
