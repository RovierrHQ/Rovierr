import { StyleSheet, Text, View } from 'react-native'

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Settings screen coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#060607',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#8E9297',
    textAlign: 'center'
  }
})
