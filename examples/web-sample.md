# web program sample

```html {browser file=app.html}
<div id="root">0</div>
<button onClick="add()">ADD</button>
<script>
let count = 0
const add = () => {
  document.getElementById('root').textContent = `${++count}`
}
</script>
```

ADDボタンを押してみよう！
