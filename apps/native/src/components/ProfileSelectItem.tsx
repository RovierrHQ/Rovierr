import type React from 'react'
import { Pressable, View } from 'react-native'
import Avatar from './Avatar'
import Icon from './Icon'
import ThemedText from './ThemedText'

type ProfileSelectItemProps = {
  name: string
  label: string
  src?: number
  isSelected?: boolean
  onPress?: () => void
}

const ProfileSelectItem: React.FC<ProfileSelectItemProps> = ({
  name,
  label,
  src,
  isSelected,
  onPress
}) => {
  return (
    <Pressable
      className="flex-row items-center bg-secondary rounded-2xl py-4"
      onPress={onPress}
    >
      <View className="flex-1">
        <ThemedText className="font-semibold text-xl">{name}</ThemedText>
        <ThemedText className="text-sm">{label}</ThemedText>
      </View>
      <View className="relative mr-4 flex-row items-center">
        {isSelected && (
          <Icon
            className=" w-7 mr-2 h-7 bg-highlight rounded-full border-2 border-secondary"
            color="white"
            name="Check"
            size={14}
            strokeWidth={2}
          />
        )}
        <Avatar
          bgColor="bg-slate-500"
          className="border border-border"
          name={name}
          size="sm"
          src={src}
        />
      </View>
    </Pressable>
  )
}

export default ProfileSelectItem
