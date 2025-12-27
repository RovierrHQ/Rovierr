import { Text } from '@native/components/ui/text'
import { View } from 'react-native'

export default function SocietiesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="title1">Societies Space</Text>
      <Text>This is where your societies content goes.</Text>
    </View>
  )
}
