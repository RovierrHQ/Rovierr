import api, { useMutation, useQuery } from '@native/lib/api-client'
import { useCallback, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'
import { Icon } from '../ui/icon'
import { ClubsList } from './clubs-list'
import { ImageUploadModal } from './image-upload-modal'
import { ProfileBanner } from './profile-banner'
import { ProfileErrorBoundary } from './profile-error-boundary'
import { ProfileInfo } from './profile-info'
import { ProfileSkeleton } from './profile-skeleton'

// Error component
const ErrorView = ({
  error,
  onRetry
}: {
  error: unknown
  onRetry: () => void
}) => (
  <View className="flex-1 justify-center items-center p-8 bg-zinc-50 dark:bg-black">
    <View className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 justify-center items-center mb-6">
      <Icon
        color="#71717a"
        materialCommunityIcon={{ name: 'code-tags' }}
        sfSymbol={{ name: 'chevron.left.forwardslash.chevron.right' }}
        size={48}
      />
    </View>

    <Text className="text-xl font-semibold text-zinc-900 dark:text-white mb-2 text-center">
      Unable to load profile
    </Text>
    <Text className="text-base font-normal text-zinc-500 text-center leading-6 mb-6">
      {(error as Error)?.message || 'Something went wrong. Please try again.'}
    </Text>

    <TouchableOpacity
      accessibilityLabel="Retry"
      accessibilityRole="button"
      className="bg-violet-600 px-5 py-3 rounded-lg min-h-[44px] justify-center items-center shadow-sm flex-row"
      onPress={onRetry}
    >
      <Icon
        color="#FFFFFF"
        materialIcon={{ name: 'add-circle' }}
        sfSymbol={{ name: 'plus.circle.fill' }}
        size={20}
      />
      <Text className="text-base font-semibold text-white ml-2">Try Again</Text>
    </TouchableOpacity>
  </View>
)

export function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false)

  // Modal states
  const [imageUploadModal, setImageUploadModal] = useState<{
    visible: boolean
    type: 'profile' | 'banner'
  }>({ visible: false, type: 'profile' })

  // Fetch profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery(['user', 'profile', 'details'], () =>
    api.user.profile.details.get()
  )

  // Image upload mutation
  const imageUploadMutation = useMutation(
    (data: { image?: string; bannerImage?: string }) =>
      api.user.profile.update.put(data),
    {
      onSuccess: () => {
        refetchProfile()
        setImageUploadModal({ visible: false, type: 'profile' })
        Toast.show({
          type: 'success',
          text1: 'Image updated successfully'
        })
      },
      onError: (error: unknown) => {
        Toast.show({
          type: 'error',
          text1: (error as Error)?.message || 'Failed to update image'
        })
      }
    }
  )

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchProfile()])
      Toast.show({
        type: 'success',
        text1: 'Profile refreshed'
      })
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to refresh data'
      })
    } finally {
      setRefreshing(false)
    }
  }, [refetchProfile])

  // Image upload handlers
  const handleEditBanner = useCallback(() => {
    setImageUploadModal({ visible: true, type: 'banner' })
  }, [])

  const handleEditAvatar = useCallback(() => {
    setImageUploadModal({ visible: true, type: 'profile' })
  }, [])

  const handleImageSave = useCallback(
    async (imageData: string) => {
      const updateData =
        imageUploadModal.type === 'profile'
          ? { image: imageData }
          : { bannerImage: imageData }

      await imageUploadMutation.mutateAsync(updateData)
    },
    [imageUploadModal.type, imageUploadMutation]
  )

  // Loading state
  if (profileLoading && !profileData) {
    return (
      <ProfileErrorBoundary onRetry={refetchProfile}>
        <ProfileSkeleton />
      </ProfileErrorBoundary>
    )
  }

  // Error state
  if (profileError && !profileData) {
    return (
      <ProfileErrorBoundary onRetry={refetchProfile}>
        <ErrorView error={profileError} onRetry={refetchProfile} />
      </ProfileErrorBoundary>
    )
  }

  // No data state (shouldn't happen with auth)
  if (!profileData) {
    return (
      <ProfileErrorBoundary onRetry={refetchProfile}>
        <ProfileSkeleton />
      </ProfileErrorBoundary>
    )
  }

  return (
    <ProfileErrorBoundary onRetry={refetchProfile}>
      <View className="flex-1 bg-zinc-50 dark:bg-black">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              // colors={['#7c3aed']}
              onRefresh={onRefresh}
              refreshing={refreshing}
              // tintColor={'#7c3aed'}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Banner */}
          <ProfileBanner
            bannerImage={profileData?.bannerImage}
            name={profileData?.name}
            onEditAvatar={handleEditAvatar}
            onEditBanner={handleEditBanner}
            profileImage={profileData?.image}
          />

          {/* Profile Info */}
          <ProfileInfo />

          {/* Clubs List */}
          <ClubsList />

          {/* Bottom spacing for safe area */}
          <View className="h-[100px]" />
        </ScrollView>

        {/* Image Upload Modal */}
        <ImageUploadModal
          currentImageUrl={
            imageUploadModal.type === 'profile'
              ? profileData?.image
              : profileData?.bannerImage
          }
          onClose={() =>
            setImageUploadModal({ visible: false, type: 'profile' })
          }
          onSave={handleImageSave}
          type={imageUploadModal.type}
          visible={imageUploadModal.visible}
        />
      </View>
    </ProfileErrorBoundary>
  )
}
