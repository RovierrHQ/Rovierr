import useThemeColors from '@rov/app/contexts/ThemeColors'
import type React from 'react'
import { View, type ViewStyle } from 'react-native'
import Avatar from './Avatar'
import Icon from './Icon'
import ThemedText from './ThemedText'

type ReviewProps = {
  rating: number
  description: string
  date: string
  username?: string
  avatar?: string
  className?: string
  style?: ViewStyle
}

const Review: React.FC<ReviewProps> = ({
  rating,
  description,
  date,
  username,
  avatar,
  className = '',
  style
}) => {
  const colors = useThemeColors()

  const renderStars = () => {
    const stars = []

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon
          className="mr-1"
          color={i < rating ? colors.text : colors.text}
          fill={i < rating ? colors.text : 'none'}
          key={i}
          name="Star"
          size={16}
          strokeWidth={1.5}
        />
      )
    }

    return (
      <View className="flex-row items-center">
        {stars}
        <ThemedText className="text-sm ml-1">{rating}.0</ThemedText>
      </View>
    )
  }

  return (
    <View className={` ${className}`} style={style}>
      <View className="flex-row">
        {(avatar || username) && (
          <Avatar className="mr-3" name={username} size="xs" src={avatar} />
        )}
        <View className="flex-1">
          {username && (
            <ThemedText className="font-bold mb-1">{username}</ThemedText>
          )}
          <View className="flex-row justify-between items-center mb-2">
            {renderStars()}
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
              {date}
            </ThemedText>
          </View>
          <ThemedText className="text-sm">{description}</ThemedText>
        </View>
      </View>
    </View>
  )
}

export default Review
