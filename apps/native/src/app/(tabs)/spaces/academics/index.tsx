import { ThemedText } from '@native/components/themed-text'
import { ThemedView } from '@native/components/themed-view'

export default function AcademicsScreen() {
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <ThemedText type="title">Academics Space</ThemedText>
      <ThemedText>This is where your academic content goes.</ThemedText>
    </ThemedView>
  )
}
