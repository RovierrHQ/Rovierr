import type React from 'react'
import { View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ThemeFooterProps extends ViewProps {
  children: React.ReactNode
}

export default function ThemedFooter({
  children,
  className,
  ...props
}: ThemeFooterProps) {
  const insets = useSafeAreaInsets()
  return (
    <View
      className={`bg-background dark:bg-dark-primary px-global pt-global w-full  ${className || ''}`}
      style={{ paddingBottom: insets.bottom }}
      {...props}
    >
      {children}
    </View>
  )
}
