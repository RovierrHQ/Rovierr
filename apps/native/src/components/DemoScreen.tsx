import { ThemedText } from '@native/components/themed-text'
import { ThemedView } from '@native/components/themed-view'
import { usePathname } from 'expo-router'

export default function DemoScreen() {
  const pathname = usePathname()
  const title = pathname
    .split('/')
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <ThemedView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText>This is a demo screen for {title}.</ThemedText>
    </ThemedView>
  )
}
