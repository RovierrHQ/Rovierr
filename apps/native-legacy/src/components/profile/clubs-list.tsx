import { authClient } from '@native/lib/auth-client'
import { useColorScheme } from '@native/lib/use-color-scheme'
import type { Organization } from '@rov/auth'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { cssInterop } from 'nativewind'
import { PressableScale } from 'pressto'
import { useCallback } from 'react'
import { Dimensions, View } from 'react-native'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle
} from '../ui/card'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'

cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle'
})

const { width: screenWidth } = Dimensions.get('window')
const cardWidth = (screenWidth - 48) / 2 // Account for padding and gap

export const ClubsList = function ClubsList() {
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
    }
  })

  const renderClubCard = ({ item }: { item: Organization }) => (
    <ClubCard club={item} />
  )

  const { colors } = useColorScheme()

  return (
    <View className="gap-2 p-4">
      <Text accessibilityRole="header" variant="heading">
        Joined Clubs
      </Text>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && clubs?.length === 0 && <EmptyState />}

      {!isLoading && clubs?.length && clubs.length > 0 && (
        <>
          <FlashList
            accessibilityLabel="List of joined clubs"
            contentContainerClassName="gap-3 py-2"
            data={clubs}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderClubCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />

          {/* Discover More Button */}
          <Button
            accessibilityHint="Opens club discovery screen"
            accessibilityLabel="Discover more clubs"
            className="mt-4"
            onPress={() => router.push('/(tabs)/spaces/societies/discover')}
            variant="secondary"
          >
            <Text variant="subhead">Discover More Clubs</Text>
            <Icon color={colors.primary} name="chevron.right" size={16} />
          </Button>
        </>
      )}
    </View>
  )
}

const ClubCard = ({ club }: { club: Organization }) => {
  const { colors } = useColorScheme()
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
    <PressableScale
      accessibilityHint={`Opens ${club.name} club details`}
      accessibilityLabel={`${club.name} club, joined ${formatJoinDate(club.createdAt)}`}
      accessibilityRole="button"
      onPress={() => router.push(`/(tabs)/spaces/societies/${club.id}`)}
      style={{ width: cardWidth }}
    >
      <Card rootClassName="shadow-sm" rootStyle={{ minHeight: 160 }}>
        <CardContent className="items-center p-4">
          <View className="items-center mb-3">
            <Avatar alt={club.name} className="mb-2 w-16 h-16">
              {club.logo ? <AvatarImage source={{ uri: club.logo }} /> : null}
              <AvatarFallback>
                <Icon
                  color={colors.mutedForeground}
                  name="person.2.fill"
                  size={32}
                />
              </AvatarFallback>
            </Avatar>
          </View>

          <View className="items-center w-full">
            <CardTitle
              className="text-center mb-2.5 text-base leading-5"
              numberOfLines={2}
            >
              {club.name}
            </CardTitle>
          </View>
        </CardContent>
        <CardFooter className="items-center justify-center pb-4">
          <CardDescription
            className="text-center"
            color="tertiary"
            variant="footnote"
          >
            Joined {formatJoinDate(club.createdAt)}
          </CardDescription>
        </CardFooter>
      </Card>
    </PressableScale>
  )
}

const LoadingSkeleton = () => (
  <View className="flex-row flex-wrap justify-between">
    {[1, 2, 3, 4].map((index) => (
      <Card key={index} rootStyle={{ width: cardWidth, minHeight: 160 }}>
        <CardContent className="p-4 items-center">
          <View className="w-16 h-16 rounded-full bg-muted mb-3" />
          <View className="w-[85%] h-4 bg-muted rounded mb-2.5" />
          <View className="w-[60%] h-3 bg-muted rounded mb-2" />
          <View className="w-[50%] h-2.5 bg-muted rounded" />
        </CardContent>
      </Card>
    ))}
  </View>
)

const EmptyState = () => {
  const { colors } = useColorScheme()
  return (
    <View className="items-center py-8">
      <View className="w-20 h-20 rounded-[40px] bg-card justify-center items-center mb-4">
        <Icon color={colors.mutedForeground} name="person.2.fill" size={48} />
      </View>

      <CardTitle accessibilityRole="header" className="mb-2">
        No Club Memberships
      </CardTitle>
      <CardDescription className="text-center mb-6 px-8" color="tertiary">
        Join clubs to connect with students who share your interests
      </CardDescription>

      <PressableScale
        accessibilityHint="Opens club discovery screen to find clubs to join"
        accessibilityLabel="Discover clubs"
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/spaces/societies/discover')}
      >
        <View className="flex-row items-center bg-primary px-5 py-3 rounded-lg min-h-[44px]">
          <Icon
            color={colors.primaryForeground}
            name="person.2.fill"
            size={20}
          />
          <Text className="ml-2" variant="subhead">
            Discover Clubs
          </Text>
        </View>
      </PressableScale>
    </View>
  )
}
