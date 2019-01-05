```js
console.error(123123123123)
console.log(1231)
process.stderr.write('error\n')
const a = 1
```

    ---stderr
    123123123123

    ---stdout
    1231

    ---stderr
    error


```js
console.log(a)
```

    ---stdout
    1

