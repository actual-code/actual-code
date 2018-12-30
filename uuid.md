# How to use uuidv4

## install

```sh {quiet}
$ yarn init -y
$ yarn add uuidv4
```


    --- stdout
    yarn init v1.10.1

    --- stderr
    warning The yes flag has been set. This will automatically answer yes to all questions, which may have security implications.

    --- stdout
    success Saved package.json
    Done in 0.04s.
    yarn add v1.10.1
    [1/4] Resolving packages...
    [2/4] Fetching packages...
    [3/4] Linking dependencies...
    [4/4] Building fresh packages...
    success Saved 1 new dependency.
    info Direct dependencies
    └─ uuidv4@2.0.0
    info All dependencies
    └─ uuidv4@2.0.0
    Done in 0.28s.


## JS

```js
const uuidv4 = require('uuidv4')
console.log(uuidv4())
```


    --- stdout
    dfb2aa27-6ecb-42f5-a367-2398c424b419

