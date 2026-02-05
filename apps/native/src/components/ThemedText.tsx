// components/ThemedText.tsx
import type React from 'react'
import { Text, type TextProps } from 'react-native'

interface ThemedTextProps extends TextProps {
  className?: string
  children: React.ReactNode
}

export default function ThemedText({
  className = '',
  children,
  ...props
}: ThemedTextProps) {
  return (
    <Text className={`text-text ${className}`} {...props}>
      {children}
    </Text>
  )
}
