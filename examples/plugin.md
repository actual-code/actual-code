```js {plugin}
const plugin = () => ({
  name: 'HOGE',
  sandbox: async (reporter, rootPath) => {
    const run = async (code, hash, filetype, meta) => {
      if (filetype !== 'hoge') {
        return false
      }
      console.log('hoge', code)
      return true
    }
    return { rootPath, run }
  }
})

plugin
```

```hoge
ほげ
```
