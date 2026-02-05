import { StyleSheet, Text, View } from 'react-native'

export default function SocietyExpenses() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Venue Booking</Text>
        <Text style={styles.cardText}>$50.00</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Snacks</Text>
        <Text style={styles.cardText}>$25.00</Text>
      </View>
      <View style={styles.totalCard}>
        <Text style={styles.totalText}>Total: $75.00</Text>
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
  },
  totalCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    alignItems: 'center'
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006064'
  }
})
