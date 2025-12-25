import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function PersonalScreen() {
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <ThemedText type="title">Personal Space</ThemedText>
      <ThemedText>This is where your personal content goes.</ThemedText>
    </ThemedView>
  )
}
