import { Icon } from '@native/components/ui/icon'
import api, { useQuery } from '@native/lib/api-client'
import { setStringAsync } from 'expo-clipboard'
import { router } from 'expo-router'
import { PressableScale } from 'pressto'
import { useMemo, useState } from 'react'
import {
  Alert,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-qr-code'

export function ShareProfileScreen() {
  const { data: profileData } = useQuery(
    ['user', 'profile', 'details'],
    () => api.user.profile.details.get(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000)
    }
  )
  const [copied, setCopied] = useState(false)

  const profileUrl = useMemo(() => {
    if (!(profileData?.username || profileData?.id)) return ''
    return `https://rovierr.com/${profileData.username || profileData.id}`
  }, [profileData?.username, profileData?.id])

  const handleCopyLink = async () => {
    try {
      await setStringAsync(profileUrl)
      setCopied(true)

      // Show success feedback
      Alert.alert('Copied!', 'Profile link copied to clipboard')

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (copyError) {
      console.error('Failed to copy link:', copyError)
      Alert.alert('Error', 'Failed to copy link to clipboard')
    }
  }

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out ${profileData?.username || profileData?.name || 'User'}'s profile on Rovierr: ${profileUrl}`,
        url: profileUrl,
        title: `${profileData?.username || profileData?.name || 'User'}'s Rovierr Profile`
      })

      if (result.action === Share.sharedAction) {
        // Successfully shared
      }
    } catch (shareError) {
      console.error('Failed to share profile:', shareError)
      Alert.alert('Error', 'Failed to share profile')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#E3E5E8] dark:border-[#374151]">
        <PressableScale
          accessibilityLabel="Close"
          accessibilityRole="button"
          onPress={() => router.back()}
        >
          <Icon
            color="#8E9297"
            materialCommunityIcon={{ name: 'code-tags' }}
            sfSymbol={{ name: 'chevron.left.forwardslash.chevron.right' }}
            size={24}
          />
        </PressableScale>

        <Text className="text-lg font-semibold text-[#060607] dark:text-white">
          Share Profile
        </Text>

        <View className="w-10" />
      </View>

      {/* Content */}
      <View className="flex-1 p-4">
        {/* Description */}
        <Text className="text-sm text-[#8E9297] text-center mb-6">
          Share your Rovierr profile to connect with other students
        </Text>

        {/* QR Code Section */}
        <View className="items-center mb-8">
          <View className="bg-white p-6 rounded-2xl shadow-sm border border-[#E3E5E8]">
            <QRCode size={200} value={profileUrl} viewBox="0 0 256 256" />
          </View>
          <Text className="text-sm text-[#8E9297] mt-4">
            Scan to view profile
          </Text>
        </View>

        {/* Profile Link Section */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-[#060607] dark:text-white mb-2">
            Profile Link
          </Text>

          <View className="flex-row items-center bg-[#F2F3F5] dark:bg-[#1F2937] rounded-lg border border-[#E3E5E8] dark:border-[#374151]">
            <TextInput
              accessibilityLabel="Profile URL"
              className="flex-1 p-3 text-sm text-[#060607] dark:text-white"
              editable={false}
              selectTextOnFocus={true}
              value={profileUrl}
            />

            <TouchableOpacity
              accessibilityLabel="Copy link"
              accessibilityRole="button"
              className="p-3 ml-2"
              onPress={handleCopyLink}
            >
              <Icon
                color={copied ? '#3BA55D' : '#5865F2'}
                materialIcon={{ name: copied ? 'add-circle' : 'add-circle' }}
                sfSymbol={{
                  name: copied ? 'plus.circle.fill' : 'doc.text.fill'
                }}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            accessibilityLabel="Share profile"
            accessibilityRole="button"
            className="flex-row items-center justify-center bg-[#5865F2] py-3.5 rounded-lg min-h-[44px] shadow-sm"
            onPress={handleShare}
          >
            <Icon color="#FFFFFF" name="paperplane.fill" size={20} />
            <Text className="text-base font-semibold text-white ml-2">
              Share Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Copy profile link"
            accessibilityRole="button"
            className="flex-row items-center justify-center bg-[#F2F3F5] dark:bg-[#1F2937] py-3.5 rounded-lg border border-[#E3E5E8] dark:border-[#374151] min-h-[44px]"
            onPress={handleCopyLink}
          >
            <Icon
              color="#5865F2"
              materialIcon={{ name: 'add-circle' }}
              sfSymbol={{ name: 'doc.text.fill' }}
              size={20}
            />
            <Text className="text-base font-semibold text-[#5865F2] ml-2">
              {copied ? 'Copied!' : 'Copy Link'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="bg-[#F2F3F5] dark:bg-[#1F2937] p-4 rounded-xl mt-auto">
          <Text className="text-sm text-[#8E9297] text-center leading-5">
            Anyone with this link can view your public profile information.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
