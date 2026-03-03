import { StyleSheet, Text, View } from 'react-native'

export default function SocietyMembers() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Members</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>John Doe</Text>
        <Text style={styles.cardText}>President</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Jane Smith</Text>
        <Text style={styles.cardText}>Treasurer</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Alice Johnson</Text>
        <Text style={styles.cardText}>Member</Text>
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
