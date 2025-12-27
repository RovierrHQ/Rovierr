import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@native/components/ui/avatar'
import { Icon } from '@native/components/ui/icon'
import { useColorScheme } from '@native/lib/use-color-scheme'
import { Image } from 'expo-image'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import { ActionIcons } from './action-icons'

const { width: screenWidth } = Dimensions.get('window')

type ProfileBannerProps = {
  bannerImage: string | null
  profileImage: string | null
  name: string
  onEditBanner: () => void
  onEditAvatar: () => void
}

export const ProfileBanner = function ProfileBanner({
  bannerImage,
  profileImage,
  name,
  onEditBanner,
  onEditAvatar
}: ProfileBannerProps) {
  const { colors } = useColorScheme()

  return (
    <View className="relative z-10">
      {/* Banner Background */}
      <View
        className="relative w-full"
        pointerEvents="box-none"
        style={{ width: screenWidth, height: 160 }}
      >
        {bannerImage ? (
          <Image
            contentFit="cover"
            placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
            pointerEvents="none"
            source={{ uri: bannerImage }}
            style={{ width: '100%', height: '100%' }}
            transition={200}
          />
        ) : (
          <View className="w-full h-full" pointerEvents="none" />
        )}

        {/* Edit Banner Button */}
        <TouchableOpacity
          accessibilityLabel="Edit banner image"
          accessibilityRole="button"
          className="absolute bottom-4 left-4 w-8 h-8 rounded-full overflow-hidden shadow-sm android:elevation-2 z-20"
          onPress={onEditBanner}
          style={{ zIndex: 20 }}
        >
          <View className="flex-1 bg-black/40 justify-center items-center">
            <Icon
              color={colors.primaryForeground}
              name="camera.fill"
              size={16}
            />
          </View>
        </TouchableOpacity>

        {/* Action Icons */}
        <ActionIcons />
      </View>

      {/* Profile Avatar */}
      <View className="absolute -bottom-10 left-0 right-0 items-center z-20">
        <View className="relative w-24 h-24">
          <Avatar
            alt={name}
            className="w-full h-full border-4 border-card shadow-lg android:elevation-8"
          >
            {profileImage ? (
              <AvatarImage
                source={{
                  uri: profileImage
                }}
              />
            ) : (
              <AvatarImage
                source={{
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=160&background=5865F2&color=fff`
                }}
              />
            )}
            <AvatarFallback className="bg-primary">
              <Icon
                color={colors.primaryForeground}
                name="person.fill"
                size={40}
              />
            </AvatarFallback>
          </Avatar>

          {/* Camera Button */}
          <TouchableOpacity
            accessibilityLabel="Change profile picture"
            accessibilityRole="button"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary justify-center items-center border-2 border-card shadow-sm android:elevation-4 z-30"
            onPress={onEditAvatar}
          >
            <Icon
              color={colors.primaryForeground}
              name="camera.fill"
              size={20}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
