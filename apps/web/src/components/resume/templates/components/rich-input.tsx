/** biome-ignore-all lint: h */
import { Link, Text, View } from '@react-pdf/renderer'
import parse, {
  domToReact,
  type Element,
  type HTMLReactParserOptions
} from 'html-react-parser'
import React from 'react'
import List from './list'

const options: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (!(domNode && (domNode as Element).tagName)) {
      return
    }

    const tagname = (domNode as Element).tagName.toLowerCase()
    const children = (domNode as Element).children
      ? domToReact((domNode as any).children, options)
      : null

    if (!children) return
    switch (tagname) {
      case 'ul':
      case 'ol': {
        const items = Array.isArray(children)
          ? (children as any).map((child: any) => {
              if (
                React.isValidElement(child) &&
                (child as any).props.children
              ) {
                return (child as any).props.children
              }
              return child
            })
          : [(children as any).props.children.props.children]
        return <List items={items} ordered={tagname === 'ol'} />
      }
      case 'p':
        console.log('paragraph', createParagraph(children))
        return createParagraph(children)
      case 'a':
        console.log('link', children)
        return <Link>{children}</Link>
      case 'strong':
        console.log('bold', children)
        return <Text style={{ fontWeight: 'bold' }}>{children}</Text>
      case 'em':
        console.log('italic', children)
        return <Text style={{ fontStyle: 'italic' }}>{children}</Text>
      case 'u':
        console.log('underline', children)
        return <Text style={{ textDecoration: 'underline' }}>{children}</Text>
      case 's':
        console.log('strikethrough', children)
        return (
          <Text style={{ textDecoration: 'line-through' }}>{children}</Text>
        )
      default:
        return
    }
  }
}

export default function RichInput({ html }: { html: string }) {
  return parse(html, options)
}

function createParagraph(
  children: string | React.JSX.Element | React.JSX.Element[]
) {
  if (!children) return null
  if (typeof children === 'string') return <Text>{children}</Text>
  if (!Array.isArray(children)) {
    return (
      <Text style={children.props.style}>
        {createParagraph(children.props.children)}
      </Text>
    )
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
      }}
    >
      {children.map((child) => {
        console.log('child', child)
        return createParagraph(child)
      })}
    </View>
  )
}
