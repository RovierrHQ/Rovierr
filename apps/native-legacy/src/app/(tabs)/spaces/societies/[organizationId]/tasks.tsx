import { StyleSheet, Text, View } from 'react-native'

export default function SocietyTasks() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prepare Budget</Text>
        <Text style={styles.cardText}>Due: Tomorrow</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Book Venue</Text>
        <Text style={styles.cardText}>Due: Next Week</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  cardText: {
    fontSize: 14,
    color: '#444'
  }
})
