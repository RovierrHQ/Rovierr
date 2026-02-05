import { type Href, Link } from 'expo-router'
import type React from 'react'
import type { ReactNode } from 'react'
import {
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native'

type CustomCardProps = {
  children: ReactNode
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  borderColor?: string
  background?: boolean
  elevation?: boolean
  className?: string
  style?: ViewStyle
  backgroundImage?: string
  backgroundImageStyle?: ViewStyle
  overlayColor?: string
  overlayOpacity?: number
  horizontal?: boolean
  onPress?: () => void
  href?: Href
}

const CustomCard: React.FC<CustomCardProps> = ({
  children,
  rounded = 'lg',
  padding = 'md',
  shadow = 'none',
  border = false,
  borderColor,
  background = true,
  elevation = true,
  className = '',
  style,
  backgroundImage,
  backgroundImageStyle,
  overlayColor = 'black',
  overlayOpacity = 0.3,
  horizontal = false,
  onPress,
  href
}) => {
  const getRoundedClass = () => {
    switch (rounded) {
      case 'none':
        return ''
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

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return ''
      case 'sm':
        return 'p-2'
      case 'md':
        return 'p-4'
      case 'lg':
        return 'p-6'
      case 'xl':
        return 'p-8'
      default:
        return 'p-4'
    }
  }

  const getShadowClass = () => {
    // Only use shadow classes on iOS
    if (!elevation || Platform.OS === 'android') return ''

    switch (shadow) {
      case 'none':
        return ''
      case 'sm':
        return 'shadow-sm'
      case 'md':
        return 'shadow'
      case 'lg':
        return 'shadow-lg'
      case 'xl':
        return 'shadow-xl'
      default:
        return 'shadow'
    }
  }

  // Get elevation value for Android
  const getElevationStyle = (): ViewStyle => {
    if (!elevation || Platform.OS !== 'android' || shadow === 'none') {
      return {}
    }

    // Map shadow values to Android elevation values
    const elevationValues = {
      sm: 2,
      md: 4,
      lg: 8,
      xl: 16
    }

    const elevationValue = elevationValues[shadow] || 4

    return {
      elevation: elevationValue,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      //shadowOpacity: 0.1,
      shadowRadius: elevationValue / 2,
      shadowOffset: {
        height: elevationValue / 3,
        width: 0
      }
    }
  }

  const getBorderClass = () => {
    if (!border) return ''
    return borderColor
      ? `border border-[${borderColor}]`
      : 'border border-black/10 dark:border-white/10'
  }

  const getBackgroundClass = () => {
    if (!background) return ''
    return 'bg-background dark:bg-dark-primary'
  }

  // Render the card with or without background image
  const renderCardContent = () => {
    const cardClasses = `
            w-full
            overflow-hidden
            ${getRoundedClass()}
            ${getPaddingClass()}
            ${getShadowClass()}
            ${getBorderClass()}
            ${!backgroundImage && getBackgroundClass()}
        `

    // Combine regular style with elevation for Android
    const combinedStyle = {
      ...style,
      ...getElevationStyle()
    }

    const content = backgroundImage ? (
      <View
        className={`overflow-visible ${getRoundedClass()} ${getShadowClass()} ${className}`}
        style={style}
      >
        <ImageBackground
          className={`${getRoundedClass()} relative w-full overflow-hidden`}
          imageStyle={{ borderRadius: getRoundedValue() }}
          source={
            typeof backgroundImage === 'string'
              ? { uri: backgroundImage }
              : backgroundImage
          }
          style={combinedStyle}
        >
          {overlayOpacity > 0 && (
            <View
              className={`${getPaddingClass()} absolute inset-0`}
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
                borderRadius: getRoundedValue()
              }}
            />
          )}
          <View>{children}</View>
        </ImageBackground>
      </View>
    ) : (
      <View
        className={`overflow-visible ${getRoundedClass()} ${getShadowClass()} ${cardClasses}  ${className} ${horizontal ? 'flex-row' : 'flex-col'}`}
        style={style}
      >
        {children}
      </View>
    )

    if (href) {
      return (
        <Link asChild href={href}>
          <TouchableOpacity activeOpacity={1}>{content}</TouchableOpacity>
        </Link>
      )
    }

    if (onPress) {
      return (
        <TouchableOpacity activeOpacity={1} onPress={onPress}>
          {content}
        </TouchableOpacity>
      )
    }

    return content
  }

  // Get numeric border radius value for ImageBackground
  const getRoundedValue = () => {
    switch (rounded) {
      case 'none':
        return 0
      case 'sm':
        return 2
      case 'md':
        return 6
      case 'lg':
        return 8
      case 'xl':
        return 12
      case '2xl':
        return 16
      case 'full':
        return 9999
      default:
        return 8
    }
  }

  return <>{renderCardContent()}</>
}

export default CustomCard
