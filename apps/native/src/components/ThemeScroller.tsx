import type React from 'react'
import { ScrollView, type ScrollViewProps, View } from 'react-native'

interface ThemedScrollerProps extends ScrollViewProps {
  className?: string
  children: React.ReactNode
}

export default function ThemedScroller({
  className = '',
  children,
  contentContainerStyle,
  ...props
}: ThemedScrollerProps) {
  return (
    <ScrollView
      bounces={false}
      className={`px-global bg-background ${className}`}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
      <View className="h-24 " />
    </ScrollView>
  )
}
