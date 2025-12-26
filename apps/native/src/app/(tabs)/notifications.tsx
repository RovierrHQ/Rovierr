import ParallaxScrollView from '@native/components/parallax-scroll-view'
import { ThemedText } from '@native/components/themed-text'
import { ThemedView } from '@native/components/themed-view'
import { IconSymbol } from '@native/components/ui/icon-symbol'
import { StyleSheet } from 'react-native'

export default function NotificationsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          color="#808080"
          name="bell.fill"
          size={310}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Notifications</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText>No new notifications.</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute'
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8
  }
})
