/** biome-ignore-all lint: ok */
import { Text, View } from '@react-pdf/renderer'
import { parse } from 'node-html-parser'
import React from 'react'

interface HtmlToPdfProps {
  html: string
  style?: Record<string, string | number>
}

export function HtmlToPdf({ html, style }: HtmlToPdfProps) {
  if (!html || html.trim() === '' || html === '<p></p>') {
    return null
  }

  const root = parse(html)
  return <>{renderNode(root, style)}</>
}

function renderNode(
  node: any,
  style?: Record<string, string | number>,
  listIndex?: number
): React.ReactNode {
  if (node.nodeType === 3) {
    const text = node.textContent?.trim()
    return text ? text : null
  }

  if (!node.tagName) {
    return node.childNodes?.map((child: any, i: number) => (
      <React.Fragment key={i}>{renderNode(child, style)}</React.Fragment>
    ))
  }

  const children = node.childNodes?.map((child: any, i: number) => (
    <React.Fragment key={i}>{renderNode(child, style, i + 1)}</React.Fragment>
  ))

  const tag = node.tagName.toLowerCase()

  if (tag === 'p') {
    return <Text style={{ marginBottom: 4, ...style }}>{children}</Text>
  }

  if (tag === 'strong' || tag === 'b') {
    return <Text style={{ fontWeight: 'bold', ...style }}>{children}</Text>
  }

  if (tag === 'em' || tag === 'i') {
    return <Text style={{ fontStyle: 'italic', ...style }}>{children}</Text>
  }

  if (tag === 'u') {
    return (
      <Text style={{ textDecoration: 'underline', ...style }}>{children}</Text>
    )
  }

  if (tag === 'ul' || tag === 'ol') {
    return <View style={{ marginLeft: 12, marginBottom: 4 }}>{children}</View>
  }

  if (tag === 'li') {
    const isOrderedList = node.parentNode?.tagName?.toLowerCase() === 'ol'
    const marker = isOrderedList ? `${listIndex}.` : '•'

    return (
      <View style={{ flexDirection: 'row', marginBottom: 2 }}>
        <Text style={{ marginRight: 4, width: 16, ...style }}>{marker}</Text>
        <View style={{ flex: 1 }}>
          <Text style={style}>{children}</Text>
        </View>
      </View>
    )
  }

  if (tag === 'br') {
    return <Text>{'\n'}</Text>
  }

  if (tag === 'a') {
    return (
      <Text style={{ color: '#0066cc', textDecoration: 'underline', ...style }}>
        {children}
      </Text>
    )
  }

  return children
}
