import * as MDAST from './mdast'

interface Context {
  list: number
}

const root = (tree: MDAST.Root, context: Context) => {
  return tree.children.map(child => compiler(child, context)).join('\n')
}

const heading = (tree: MDAST.Heading, context: Context) => {
  const options = []
  const s = tree.children
    .map(child => {
      if (child.type === 'linkReference') {
        options.push(child.identifier)
      } else {
        return compiler(child, context)
      }
    })
    .join('')
    .trim()
  const option = options.length === 0 ? '' : `[${options.join(',')}]`
  return `${'='.repeat(tree.depth)}${option} ${s}`
}

const text = (tree: MDAST.Text) => {
  return tree.value
}

const paragraph = (tree: MDAST.Paragraph, context: Context) => {
  return `\n${tree.children.map(child => compiler(child, context)).join('')}\n`
}

const inlineCode = (tree: MDAST.InlineCode) => {
  return `@<code>{${tree.value}}`
}

const breakNode = () => {
  return `\n`
}

const code = (tree: MDAST.Code) => {
  const lang = tree.lang ? `[${tree.lang}]` : ''
  return `//listnum[][]${lang}{\n${tree.value}\n//}`
}

const link = (tree: MDAST.Link, context: Context) => {
  const s = tree.children.map(child => compiler(child, context)).join('')
  return `@<href>{${tree.url}${s ? `, ${s}` : ''}}`
}

const list = (tree: MDAST.List, context: Context) => {
  return tree.children
    .map(child => compiler(child, { ...context, list: context.list + 1 }))
    .join('')
}

const listItem = (tree: MDAST.ListItem, context: Context) => {
  return ` ${'*'.repeat(context.list)} ${tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()}\n`
}

const ignore = () => ''

const blockquote = (tree: MDAST.Blockquote, context: Context) => {
  return `//quote{\n${tree.children.map(child => compiler(child, context))}}\n`
}

const compilers: {
  [props: string]: (tree: MDAST.Node, context: Context) => string
} = {
  root,
  paragraph,
  heading,
  thematicBreak: ignore,
  blockquote,
  text,
  inlineCode,
  break: breakNode,
  code,
  link,
  list,
  listItem,
}

export const compiler = (tree: MDAST.Node, context: Context): string => {
  if (!(tree.type in compilers)) {
    console.log(tree)
    return 'WRONG'
  }
  return compilers[tree.type](tree, context)
}

export default function mdToReview() {
  this.Compiler = (tree: MDAST.Root) => {
    try {
      return compiler(tree, { list: 0 })
    } catch (e) {
      console.log(tree)
      return 'WRONG'
    }
  }
}
