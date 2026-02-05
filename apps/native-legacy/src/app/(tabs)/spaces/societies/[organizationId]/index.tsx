import { useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

export default function SocietyDashboard() {
  const { organizationId } = useLocalSearchParams()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Society Overview</Text>
        <Text style={styles.subtitle}>ID: {organizationId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Orientation Day</Text>
          <Text style={styles.cardText}>Friday, 2:00 PM - Main Hall</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Meeting</Text>
          <Text style={styles.cardText}>Monday, 5:00 PM - Room 304</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discussions</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Planning</Text>
          <Text style={styles.cardText}>Last reply 2 hours ago</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Event Ideas</Text>
          <Text style={styles.cardText}>Last reply 5 hours ago</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
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
