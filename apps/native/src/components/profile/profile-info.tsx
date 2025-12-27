import { Icon } from '@native/components/ui/icon'
import { Text } from '@native/components/ui/text'
import api, { useQuery } from '@native/lib/api-client'
import { useColorScheme } from '@native/lib/use-color-scheme'
import { PressableScale } from 'pressto'
import { Alert, Linking, View } from 'react-native'

export const ProfileInfo = function ProfileInfo() {
  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMonths =
      (now.getFullYear() - date.getFullYear()) * 12 +
      (now.getMonth() - date.getMonth())

    if (diffInMonths < 12) {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    }
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleSocialLinkPress = async (platform: string, url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) {
        await Linking.openURL(url)
      } else {
        Alert.alert('Error', `Cannot open ${platform} link`)
      }
    } catch (linkError) {
      console.error(`Failed to open ${platform} link:`, linkError)
      Alert.alert('Error', `Failed to open ${platform} link`)
    }
  }

  const getSocialIcon = (
    platform: string
  ): 'paperplane.fill' | 'person.fill' => {
    // Using available icons from the mapping
    switch (platform) {
      case 'telegram':
      case 'whatsapp':
        return 'paperplane.fill'
      default:
        return 'person.fill'
    }
  }

  // Fetch profile data
  const { data: profileData } = useQuery(['user', 'profile', 'details'], () =>
    api.user.profile.details.get()
  )

  const socialLinksArray = Object.entries(profileData?.socialLinks || {})
    .filter(([_, url]) => url)
    .map(([platform, url]) => ({ platform, url: url || '' }))

  const { colors } = useColorScheme()
  console.log('profileData', profileData?.currentUniversity)

  return (
    <View className="px-4 pt-12 pb-4 rounded-b-3xl gap-1 bg-card">
      {/* Name and Verification */}
      <View accessibilityRole="header" className="items-center">
        <View className="flex-row items-center gap-2">
          <Text accessibilityRole="text" variant="title1">
            {profileData?.name}
          </Text>
          {profileData?.studentStatusVerified ? (
            <View
              accessibilityLabel="Verified student status"
              accessibilityRole="text"
              className="flex-row items-center gap-1 bg-emerald-500/10 dark:bg-emerald-900/30 px-2 py-1 rounded-xl"
            >
              <Icon
                color="emerald-500"
                name="checkmark.circle.fill"
                size={16}
              />
              <Text className="text-emerald-500" variant="caption1">
                Verified
              </Text>
            </View>
          ) : (
            <View
              accessibilityLabel="Not verified student status"
              accessibilityRole="text"
              className="flex-row items-center gap-1 bg-muted px-2 py-1 rounded-xl"
            >
              <Icon
                color={colors.destructive}
                name="xmark.circle.fill"
                size={16}
              />
              <Text color="primary" variant="caption1">
                Not verified
              </Text>
            </View>
          )}
        </View>

        {profileData?.username && (
          <View className="">
            <Text
              accessibilityLabel={`Username: ${profileData?.username}`}
              accessibilityRole="text"
              color="tertiary"
              variant="footnote"
            >
              @{profileData?.username}
            </Text>
          </View>
        )}
      </View>

      {/* Bio */}
      {profileData?.bio && (
        <View className="items-center">
          <Text
            accessibilityLabel={`Bio: ${profileData?.bio}`}
            accessibilityRole="text"
            color="primary"
            variant="callout"
          >
            {profileData?.bio}
          </Text>
        </View>
      )}

      {/* Current University */}
      {profileData?.currentUniversity?.name && (
        <View className="items-center">
          <Text color="primary" variant="footnote">
            {profileData?.currentUniversity?.name}
          </Text>
        </View>
      )}

      {/* Major and Year of Study */}
      <View className="flex-row flex-wrap gap-2 justify-center">
        {profileData?.major && (
          <View
            accessibilityLabel={`Major: ${profileData?.major}`}
            accessibilityRole="text"
            className="bg-muted border border-border px-3 py-1.5 rounded-2xl"
          >
            <Text color="tertiary" variant="caption1">
              {profileData?.major}
            </Text>
          </View>
        )}

        {profileData?.yearOfStudy && (
          <View
            accessibilityLabel={`Year of study: ${profileData?.yearOfStudy}`}
            accessibilityRole="text"
            className="bg-muted border border-border px-3 py-1.5 rounded-2xl"
          >
            <Text color="tertiary" variant="caption1">
              Year {profileData?.yearOfStudy}
            </Text>
          </View>
        )}
      </View>

      {/* Member Since */}
      {profileData?.createdAt && (
        <View
          accessibilityLabel={`Member since ${formatMemberSince(profileData.createdAt)}`}
          accessibilityRole="text"
          className="flex-row items-center justify-center gap-1.5 mb-4"
        >
          <Icon color={colors.mutedForeground} name="bell.fill" size={16} />
          <Text color="tertiary" variant="footnote">
            Member since {formatMemberSince(profileData.createdAt)}
          </Text>
        </View>
      )}

      {/* Social Links */}
      {socialLinksArray.length > 0 && (
        <View className="mt-2">
          <View className="mb-3">
            <Text accessibilityRole="header" variant="callout">
              Connect
            </Text>
          </View>
          <View
            accessibilityLabel="Social media links"
            className="flex-row flex-wrap gap-2"
          >
            {socialLinksArray.map(({ platform, url }) => (
              <PressableScale
                accessibilityHint={`Opens ${platform} in external app`}
                accessibilityLabel={`Open ${platform} profile`}
                accessibilityRole="button"
                key={platform}
                onPress={() => handleSocialLinkPress(platform, url)}
              >
                <View className="flex-row items-center gap-1.5 bg-muted px-3 py-2 rounded-lg border border-border">
                  <Icon
                    color={colors.accent}
                    name={getSocialIcon(platform)}
                    size={20}
                  />
                  <Text color="tertiary" variant="footnote">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
