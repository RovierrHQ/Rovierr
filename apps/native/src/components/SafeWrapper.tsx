import { usePathname } from 'expo-router'
import type React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SafeWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const bypassRoutes = [
    // '/screens/onboarding-start',
    '/modal'
    // '/fullscreen',
    // //'/(drawer)/(tabs)/index',
  ]

  const shouldBypass = bypassRoutes.includes(pathname)

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-primary"
      edges={shouldBypass ? [] : undefined}
    >
      {children}
    </SafeAreaView>
  )
}
