import { Text } from '@native/components/ui/text'
import { usePathname } from 'expo-router'
import { View } from 'react-native'

export default function DemoScreen() {
  const pathname = usePathname()
  const title = pathname
    .split('/')
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="title1">{title}</Text>
      <Text>This is a demo screen for {title}.</Text>
    </View>
  )
}
