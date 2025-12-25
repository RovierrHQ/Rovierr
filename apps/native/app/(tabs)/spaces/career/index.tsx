import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function CareerScreen() {
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <ThemedText type="title">Career Space</ThemedText>
      <ThemedText>This is where your career content goes.</ThemedText>
    </ThemedView>
  )
}
