import { Text } from '@native/components/ui/text'
import { View } from 'react-native'

export default function PersonalScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="title1">Personal Space</Text>
      <Text>This is where your personal content goes.</Text>
    </View>
  )
}
