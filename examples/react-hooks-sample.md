---
tags: react
---

# React Hooks Sample

## install

```sh {quiet}
$ yarn init -y
$ yarn add react@next react-dom@next
```

## React code

```jsx {browser file=app.jsx}
import React, {useState} from 'react'
import {render} from 'react-dom'

const App = () => {
  const [counter, setCounter] = useState(0)

  return (<div>
    <div>{counter}</div>
    <div><button onClick={() => setCounter(counter + 1)}>ADD</button></div>
    <div><button onClick={() => setCounter(counter - 1)}>DEC</button></div>
  </div>)
}


render(<App />, document.getElementById('root'))
```

## HTML

```html {browser file=app.html}
<div id="root"></div>
<script src="./app.jsx"></script>
```
