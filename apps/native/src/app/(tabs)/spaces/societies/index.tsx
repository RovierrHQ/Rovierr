import { ThemedText } from '@native/components/themed-text'
import { ThemedView } from '@native/components/themed-view'

export default function SocietiesScreen() {
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <ThemedText type="title">Societies Space</ThemedText>
      <ThemedText>This is where your societies content goes.</ThemedText>
    </ThemedView>
  )
}
