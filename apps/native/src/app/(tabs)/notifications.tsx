import { Text } from '@native/components/ui/text'
import { StyleSheet, View } from 'react-native'

export default function NotificationsScreen() {
  return (
    <View>
      <View style={styles.titleContainer}>
        <Text variant="title1">Notifications</Text>
      </View>
      <View>
        <Text variant="body">No new notifications.</Text>
      </View>
    </View>
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
