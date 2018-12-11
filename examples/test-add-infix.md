# add infix to filename

```js
const addInfix = (filename, addition) => {
  return filename.replace(/(\.[^.]+)$/, `.${addition}$1`)
}

console.log(addInfix('file.md', 'generated'))
console.log(addInfix('file.hoge.md', 'generated'))

```
