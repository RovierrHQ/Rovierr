// components/Button.tsx

import useThemeColors from '@rov/app/contexts/ThemeColors'
import { type Href, router } from 'expo-router'
import type React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import Icon, { type IconName } from './Icon'

type RoundedOption = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

type ButtonProps = {
  title?: string
  onPress?: () => void
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  rounded?: RoundedOption
  href?: Href
  className?: string
  textClassName?: string
  disabled?: boolean
  iconStart?: IconName
  iconEnd?: IconName
  iconSize?: number
  iconColor?: string
  iconClassName?: string
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'medium',
  rounded = 'lg',
  href,
  className = '',
  textClassName = '',
  disabled = false,
  iconStart,
  iconEnd,
  iconSize,
  iconColor,
  iconClassName = '',
  ...props
}) => {
  const buttonStyles = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-border bg-transparent',
    ghost: 'bg-transparent'
  }

  const buttonSize = {
    small: 'py-2',
    medium: 'py-3',
    large: 'py-5'
  }

  const roundedStyles = {
    none: 'rounded-none',
    xs: 'rounded-xs',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }

  const textColor =
    variant === 'outline' || variant === 'secondary' || variant === 'ghost'
      ? 'text-text'
      : 'text-invert'
  const disabledStyle = disabled ? 'opacity-50' : ''

  // Default icon sizes based on button size
  const getIconSize = () => {
    if (iconSize) return iconSize

    switch (size) {
      case 'small':
        return 16
      case 'medium':
        return 18
      case 'large':
        return 20
      default:
        return 18
    }
  }
  const colors = useThemeColors()

  // Default icon color based on variant
  const getIconColor = () => {
    if (iconColor) return iconColor

    return variant === 'outline' ||
      variant === 'secondary' ||
      variant === 'ghost'
      ? colors.text // highlight color
      : colors.invert // white
  }

  const ButtonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' ||
            variant === 'secondary' ||
            variant === 'ghost'
              ? '#0EA5E9'
              : '#fff'
          }
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {iconStart && (
            <Icon
              className={`mr-2 ${iconClassName} `}
              color={getIconColor()}
              name={iconStart}
              size={getIconSize()}
            />
          )}

          <Text className={`${textColor} font-medium ${textClassName}`}>
            {title}
          </Text>

          {iconEnd && (
            <Icon
              className={`ml-2 ${iconClassName}`}
              color={getIconColor()}
              name={iconEnd}
              size={getIconSize()}
            />
          )}
        </View>
      )}
    </>
  )

  if (href) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className={`px-4 relative ${buttonStyles[variant]} ${buttonSize[size]} ${roundedStyles[rounded]} items-center justify-center ${disabledStyle} ${className}`}
        disabled={loading || disabled}
        {...props}
        onPress={() => {
          router.push(href)
        }}
      >
        {ButtonContent}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`px-4 relative ${buttonStyles[variant]} ${buttonSize[size]} ${roundedStyles[rounded]} items-center justify-center ${disabledStyle} ${className}`}
      disabled={loading || disabled}
      onPress={onPress}
      {...props}
    >
      {ButtonContent}
    </TouchableOpacity>
  )
}
