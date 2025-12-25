import { useTranslation } from '@rovierr/localization'
import { useAtomValue } from 'jotai'
import { StyleSheet } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { currentSpaceAtom } from '@/store/space'

export default function SpaceContentScreen() {
  const currentSpaceId = useAtomValue(currentSpaceAtom)
  const { t } = useTranslation()

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        {t(`common:${currentSpaceId}`, currentSpaceId)} Space
      </ThemedText>
      <ThemedText>
        Welcome to the {t(`common:${currentSpaceId}`, currentSpaceId)} space.
      </ThemedText>
      <ThemedText style={styles.instruction}>
        Use the drawer to navigate within this space, or the "Switch" button to
        change spaces.
      </ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  instruction: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  }
})
