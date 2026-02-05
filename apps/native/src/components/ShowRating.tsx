import { Ionicons } from '@expo/vector-icons'
import { useThemeColors } from '@rov/app/contexts/ThemeColors'
import type React from 'react'
import { View, type ViewStyle } from 'react-native'
import ThemedText from './ThemedText'

type ShowRatingProps = {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  displayMode?: 'number' | 'stars'
  className?: string
  color?: string
  style?: ViewStyle
}

const ShowRating: React.FC<ShowRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  displayMode = 'number',
  className = '',
  color,
  style
}) => {
  const colors = useThemeColors()

  const starColor = color || colors.text

  const getSize = () => {
    switch (size) {
      case 'sm':
        return { icon: 12, text: 'text-xs' }
      case 'md':
        return { icon: 16, text: 'text-sm' }
      case 'lg':
        return { icon: 20, text: 'text-base' }
      default:
        return { icon: 16, text: 'text-sm' }
    }
  }

  if (displayMode === 'number') {
    return (
      <View
        className={`flex-row  items-center gap-x-1 ${className}`}
        style={style}
      >
        <Ionicons color={starColor} name="star" size={getSize().icon} />
        <ThemedText
          className={`font-medium ${getSize().text}`}
          style={color ? { color: starColor } : undefined}
        >
          {rating.toFixed(1)}
        </ThemedText>
      </View>
    )
  }

  return (
    <View className={`flex-row gap-0.5 ${className}`}>
      {[...new Array(maxRating)].map((_, index) => (
        <Ionicons
          color={starColor}
          key={index}
          name={index < Math.round(rating) ? 'star' : 'star-outline'}
          size={getSize().icon}
        />
      ))}
    </View>
  )
}

export default ShowRating
