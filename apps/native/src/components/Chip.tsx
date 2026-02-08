import useThemeColors from '@rov/contexts/ThemeColors'
import { type Href, Link } from 'expo-router'
import React, { type ReactNode } from 'react'
import {
  Image,
  type ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native'
import Icon, { type IconName } from './Icon'

type ChipSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

type ChipProps = {
  label: string
  isSelected?: boolean
  className?: string
  style?: ViewStyle
  size?: ChipSize
  href?: Href
  onPress?: () => void
  icon?: IconName // Correct icon type
  iconSize?: number
  iconColor?: string
  image?: ImageSourcePropType
  imageSize?: number
  leftContent?: ReactNode // For custom left content
  selectable?: boolean // New property for selectable chips
}

export const Chip = ({
  label,
  isSelected,
  className,
  style,
  size = 'md',
  href,
  onPress,
  icon,
  iconSize,
  iconColor,
  image,
  imageSize,
  leftContent,
  selectable
}: ChipProps) => {
  // Size mappings
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
    xl: 'px-5 py-2 text-lg',
    xxl: 'px-6 py-2.5 text-xl'
  }

  // Default icon/image sizes based on chip size
  const getDefaultIconSize = () => {
    const sizes = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 }
    return iconSize || sizes[size]
  }

  const getDefaultImageSize = () => {
    const sizes = { xs: 16, sm: 18, md: 20, lg: 24, xl: 28, xxl: 32 }
    return imageSize || sizes[size]
  }

  // Handle selectable chips - if selectable is true and no onPress is provided, create a toggle handler
  const [selected, setSelected] = React.useState(isSelected)

  const handlePress = () => {
    if (selectable) {
      setSelected(!selected)
    }
    onPress?.()
  }

  // Use either the controlled isSelected prop or internal selected state
  const isChipSelected = selectable ? selected : isSelected
  const colors = useThemeColors()
  // Render left content (icon, image, or custom content)
  const renderLeftContent = () => {
    if (leftContent) {
      return leftContent
    }

    if (icon) {
      return (
        <Icon
          className="mr-2 -ml-1"
          color={iconColor || (isChipSelected ? colors.icon : colors.icon)}
          name={icon}
          size={getDefaultIconSize()}
        />
      )
    }

    if (image) {
      return (
        <Image
          className="rounded-lg mr-2 -ml-2"
          source={image}
          style={{
            width: getDefaultImageSize(),
            height: getDefaultImageSize()
          }}
        />
      )
    }

    return null
  }

  // Extract size-specific classes
  const [paddingClasses, textSizeClass] = sizeClasses[size].split(' text-')

  // The chip content
  const chipContent = (
    <>
      <View className="flex-row items-center">
        {renderLeftContent()}
        <Text
          className={`text-${textSizeClass} ${isChipSelected ? 'text-black ' : 'text-text'}`}
        >
          {label}
        </Text>
      </View>
    </>
  )

  // Wrapper with appropriate styling
  const chipWrapper = (children: ReactNode) => (
    <View
      className={`${className} ${paddingClasses} rounded-full ${isChipSelected ? 'bg-highlight' : 'bg-secondary'} flex-row items-center justify-center`}
      style={style}
    >
      {children}
    </View>
  )

  // Return either a Link or TouchableOpacity based on props
  if (href) {
    return (
      <Link asChild href={href}>
        <TouchableOpacity activeOpacity={0.7}>
          {chipWrapper(chipContent)}
        </TouchableOpacity>
      </Link>
    )
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!(onPress || selectable)}
      onPress={handlePress}
    >
      {chipWrapper(chipContent)}
    </TouchableOpacity>
  )
}
