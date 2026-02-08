import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import useThemeColors from '@rov/contexts/ThemeColors'
import { shadowPresets } from '@rov/utils/useShadow'
import { LinearGradient } from 'expo-linear-gradient'
import { type Href, router } from 'expo-router'
import {
  Dimensions,
  Image,
  ImageBackground,
  type ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native'
import { Button } from './Button'
import Favorite from './Favorite'
import ThemedText from './ThemedText'

const { width: _ } = Dimensions.get('window')
type CardProps = {
  title: string
  description?: string
  hasShadow?: boolean
  image: string | ImageSourcePropType
  href?: Href
  onPress?: () => void
  variant?: 'classic' | 'overlay' | 'compact' | 'minimal'
  className?: string
  button?: string
  onButtonPress?: () => void
  price?: string
  rating?: number
  badge?: string
  badgeColor?: string
  icon?: string
  iconColor?: string
  imageHeight?: number
  showOverlay?: boolean
  hasFavorite?: boolean
  overlayGradient?: readonly [string, string]
  width?: any
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  children?: React.ReactNode
  style?: ViewStyle
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  hasShadow = false,
  href,
  onPress,
  variant = 'classic',
  className = 'w-full',
  button,
  onButtonPress,
  price,
  rating,
  badge,
  hasFavorite = false,
  badgeColor = '#000000',
  imageHeight = 200,
  showOverlay = true,
  overlayGradient = ['transparent', 'rgba(0,0,0,0.3)'] as readonly [
    string,
    string
  ],
  rounded = 'lg',
  width = '100%',
  children,
  style,
  ...props
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress()
    }
  }

  const getRoundedClass = () => {
    switch (rounded) {
      case 'none':
        return 'rounded-none'
      case 'sm':
        return 'rounded-sm'
      case 'md':
        return 'rounded-md'
      case 'lg':
        return 'rounded-lg'
      case 'xl':
        return 'rounded-xl'
      case '2xl':
        return 'rounded-2xl'
      case 'full':
        return 'rounded-full'
      default:
        return 'rounded-lg'
    }
  }

  const renderBadge = () => {
    if (!badge) return null
    return (
      <View
        className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full ${getRoundedClass()}`}
        style={{ backgroundColor: badgeColor }}
      >
        <Text className="text-white text-xs font-medium">{badge}</Text>
      </View>
    )
  }
  const colors = useThemeColors()
  const renderRating = () => {
    if (!rating) return null
    return (
      <View className="flex-row items-center">
        <MaterialIcons color={colors.text} name="star" size={16} />
        <ThemedText className="text-xs font-semibold ml-0">{rating}</ThemedText>
      </View>
    )
  }

  const renderPrice = () => {
    if (!price) return null
    return (
      <ThemedText
        className={`text-sm font-bold  ${variant === 'overlay' ? 'text-white' : 'text-dark-primary dark:text-white'}`}
      >
        {price}
      </ThemedText>
    )
  }

  const renderContent = () => {
    const cardContent = (
      <View
        className={`flex-1 bg-secondary  dark:bg-dark-secondary ${getRoundedClass()} ${className}`}
        style={[
          hasShadow && {
            ...shadowPresets.card
          },
          style
        ]}
      >
        <View className="relative">
          {hasFavorite && (
            <View className="absolute top-2 right-2 z-50">
              <Favorite initialState={false} productName={title} size={24} />
            </View>
          )}
          {variant === 'overlay' ? (
            <ImageBackground
              className={`w-full overflow-hidden ${getRoundedClass()}`}
              source={typeof image === 'string' ? { uri: image } : image}
              style={{ height: imageHeight || 200 }}
            >
              {showOverlay && (
                <LinearGradient
                  className="w-full h-full relative flex flex-col justify-end"
                  colors={overlayGradient}
                >
                  <View className="p-4 absolute bottom-0 left-0 right-0">
                    <Text className="text-base font-bold text-white">
                      {title}
                    </Text>
                    {description && (
                      <Text className="text-xs text-white" numberOfLines={1}>
                        {description}
                      </Text>
                    )}
                    {(price || rating) && (
                      <View className="flex-row items-center mt-1 justify-between">
                        {renderPrice()}
                        {renderRating()}
                      </View>
                    )}
                  </View>
                </LinearGradient>
              )}
            </ImageBackground>
          ) : (
            <Image
              className={`w-full ${getRoundedClass()}`}
              source={typeof image === 'string' ? { uri: image } : image}
              style={{
                height: imageHeight || 200,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0
              }}
            />
          )}
          {renderBadge()}
        </View>

        {variant !== 'overlay' && (
          <View className="p-3 w-full flex-1 ">
            <ThemedText className="text-sm font-semibold mb-2">
              {title}
            </ThemedText>

            {description && (
              <ThemedText
                className="text-xs text-gray-600 dark:text-gray-300"
                numberOfLines={1}
              >
                {description}
              </ThemedText>
            )}
            {(price || rating) && (
              <View className="flex-row items-center mt-auto justify-between">
                {renderPrice()}
                {renderRating()}
              </View>
            )}
            {children}
            {button && (
              <Button
                className="mt-3"
                onPress={onButtonPress}
                size="small"
                title={button}
              />
            )}
          </View>
        )}
      </View>
    )

    if (href) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          className={`${variant === 'overlay' ? '!h-auto' : ''} ${className}`}
          onPress={() => router.push(href)}
          style={{ width, ...style }}
        >
          {cardContent}
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className={`${variant === 'overlay' ? '!h-auto' : ''} ${className}`}
        onPress={handlePress}
        style={{ width, ...style }}
      >
        {cardContent}
      </TouchableOpacity>
    )
  }

  return renderContent()
}

export default Card
