import { IconSymbol } from '@native/components/ui/icon-symbol'
import { authClient } from '@native/lib/auth-client'
import type { Organization } from '@rov/auth'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const { width: screenWidth } = Dimensions.get('window')
const cardWidth = (screenWidth - 48) / 2 // Account for padding and gap

export const ClubsList = function ClubsList() {
  const router = useRouter()
  // Fetch clubs data
  const {
    data: clubs,
    isLoading
    // refetch: refetchClubs
  } = useQuery({
    queryKey: ['organizations', 'list'],
    queryFn: async () => {
      const response = await authClient.organization.list()
      if (response.data) {
        // Transform the data to match ClubMembership type
        return response.data.map((club) => ({
          ...club,
          logo: club.logo || null // Convert undefined to null
        }))
      }
      if (response.error) {
        throw new Error(response.error.message)
      }
      return []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (renamed from cacheTime)
    retry: 2,
    retryDelay: 1000
  })

  const renderClubCard = ({ item }: { item: Organization }) => (
    <ClubCard club={item} />
  )

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        Joined Clubs
      </Text>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && clubs?.length === 0 && <EmptyState />}

      {!isLoading && clubs?.length && clubs.length > 0 && (
        <>
          <FlatList
            accessibilityLabel="List of joined clubs"
            columnWrapperStyle={styles.row}
            data={clubs}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderClubCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false} // Disable scroll since it's inside a ScrollView
          />

          {/* Discover More Button */}
          <TouchableOpacity
            accessibilityHint="Opens club discovery screen"
            accessibilityLabel="Discover more clubs"
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/spaces/societies/discover')}
            style={styles.discoverMoreButton}
          >
            <Text style={styles.discoverMoreText}>Discover More Clubs</Text>
            <IconSymbol color="#5865F2" name="chevron.right" size={16} />
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const ClubCard = ({ club }: { club: Organization }) => {
  const router = useRouter()
  const formatJoinDate = useCallback((date: Date | string | undefined) => {
    if (!date) return 'Recently'

    let dateObj: Date

    if (typeof date === 'string') {
      // Handle PostgreSQL timestamp format: "2025-12-05 10:56:37.104+00"
      // Convert to ISO format by replacing space with 'T' and ensuring proper timezone
      const isoString = date.includes('T')
        ? date
        : date.replace(' ', 'T').replace('+00', '+00:00')

      dateObj = new Date(isoString)
    } else {
      dateObj = date
    }

    // Check if the date is valid
    if (!dateObj || Number.isNaN(dateObj.getTime())) {
      return 'Recently'
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }, [])
  return (
    <TouchableOpacity
      accessibilityHint={`Opens ${club.name} club details`}
      accessibilityLabel={`${club.name} club, joined ${formatJoinDate(club.createdAt)}`}
      accessibilityRole="button"
      onPress={() => router.push(`/(tabs)/spaces/societies/${club.id}`)}
      style={styles.clubCard}
    >
      <View style={styles.clubLogoContainer}>
        <Image
          accessibilityIgnoresInvertColors
          contentFit="cover"
          placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
          source={{
            uri:
              club.logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(club.name)}&size=120&background=5865F2&color=fff`
          }}
          style={styles.clubLogo}
          transition={200}
        />
      </View>

      <View style={styles.clubInfo}>
        <Text numberOfLines={2} style={styles.clubName}>
          {club.name}
        </Text>

        <View style={styles.clubMeta}>
          <View accessibilityLabel="Member status" style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        </View>

        <Text style={styles.joinDate}>
          Joined {formatJoinDate(club.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const LoadingSkeleton = () => (
  <View style={styles.skeletonGrid}>
    {[1, 2, 3, 4].map((index) => (
      <View key={index} style={styles.skeletonCard}>
        <View style={styles.skeletonLogo} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonSubtext} />
      </View>
    ))}
  </View>
)

const EmptyState = () => {
  const router = useRouter()
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <IconSymbol color="#8E9297" name="person.2.fill" size={48} />
      </View>

      <Text accessibilityRole="header" style={styles.emptyTitle}>
        No Club Memberships
      </Text>
      <Text style={styles.emptyDescription}>
        Join clubs to connect with students who share your interests
      </Text>

      <TouchableOpacity
        accessibilityHint="Opens club discovery screen to find clubs to join"
        accessibilityLabel="Discover clubs"
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/spaces/societies/discover')}
        style={styles.discoverButton}
      >
        <IconSymbol color="#FFFFFF" name="person.2.fill" size={20} />
        <Text style={styles.discoverButtonText}>Discover Clubs</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#060607',
    marginBottom: 16
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12
  },
  clubCard: {
    width: cardWidth,
    backgroundColor: '#F2F3F5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    minHeight: 120 // Ensure adequate touch target
  },
  clubLogoContainer: {
    alignItems: 'center',
    marginBottom: 8
  },
  clubLogo: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  clubInfo: {
    alignItems: 'center'
  },
  clubName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#060607',
    textAlign: 'center',
    marginBottom: 6
  },
  clubMeta: {
    marginBottom: 4
  },
  memberBadge: {
    backgroundColor: '#5865F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  joinDate: {
    fontSize: 12,
    color: '#8E9297'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#060607',
    marginBottom: 8
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8E9297',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5865F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44 // Ensure minimum touch target
  },
  discoverButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8
  },
  discoverMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F3F5',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    minHeight: 44 // Ensure minimum touch target
  },
  discoverMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5865F2',
    marginRight: 4
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  skeletonCard: {
    width: cardWidth,
    backgroundColor: '#F2F3F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center'
  },
  skeletonLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3E5E8',
    marginBottom: 8
  },
  skeletonText: {
    width: '80%',
    height: 14,
    backgroundColor: '#E3E5E8',
    borderRadius: 4,
    marginBottom: 6
  },
  skeletonSubtext: {
    width: '60%',
    height: 12,
    backgroundColor: '#E3E5E8',
    borderRadius: 4
  }
})
