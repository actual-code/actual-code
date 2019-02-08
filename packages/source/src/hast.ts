import Unist from 'unist'

export type Node = Root | Element | Doctype | Comment | Text

export interface Parent extends Unist.Parent {
  children: [Element | Doctype | Comment | Text]
}

export interface Literal extends Unist.Literal {
  value: string
}

/**
 * Root node of HAST
 * see. https://github.com/syntax-tree/hast
 */
export interface Root extends Parent {
  type: 'root'
}

export interface Element extends Parent {
  type: 'element'
  tagname: string
  properties?: Properties
  content?: Root
  childrent: [Element | Comment | Text]
}

export interface Properties {
  [props: string]: any
}

export type PropertyName = string
export type PropertyValue = any

export interface Doctype extends Unist.Node {
  type: 'doctype'
  name: string
  public?: string
  system?: string
}

export interface Comment extends Literal {
  type: 'comment'
}

export interface Text extends Literal {
  type: 'text'
}
