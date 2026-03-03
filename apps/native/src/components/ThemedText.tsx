// components/ThemedText.tsx
import type React from 'react'
import { Text, type TextProps } from 'react-native'

interface ThemedTextProps extends TextProps {
  children: React.ReactNode
  className?: string
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
