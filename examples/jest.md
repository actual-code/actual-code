# unit test

```sh
$ yarn init -y
$ yarn add -D jest ts-jest @types/jest
$ mkdir -p src
```

```json {file="tsconfig.json"}
{
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]

}
```


```js {noexec file="jest.config.js"}
module.exports = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  testMatch: ['**/src/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/'],
  preset: 'ts-jest'
}
```

```ts {noexec file="src/hoge.ts"}
export const hoge = 'hoge'
```

```ts {noexec file="src/hoge.test.ts"}
import { hoge } from './hoge'

test('hoge', () => {
  expect(hoge).toBe('hoge')
})
```

```sh
$ npx jest
```
