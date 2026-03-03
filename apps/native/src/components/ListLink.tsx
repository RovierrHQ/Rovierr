import { type Href, Link } from 'expo-router'
import type React from 'react'
import { Pressable, View, type ViewStyle } from 'react-native'
import Icon, { type IconName } from './Icon'
import ThemedText from './ThemedText'

type ListLinkProps = {
  icon?: IconName
  title: string
  description?: string
  href?: Href
  onPress?: () => void
  showChevron?: boolean
  className?: string
  iconSize?: number
  rightIcon?: IconName
  disabled?: boolean
  style?: ViewStyle
  hasBorder?: boolean
}

const ListLink: React.FC<ListLinkProps> = ({
  icon,
  title,
  description,
  href,
  onPress,
  showChevron = false,
  className = '',
  iconSize = 20,
  rightIcon = 'ChevronRight',
  disabled = false,
  style,
  hasBorder = false
}) => {
  // Component for the actual content
  const Content = () => (
    <View
      className={`flex-row items-center py-4 ${className} ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      {icon && (
        <View className="mr-4 h-12 w-12 rounded-full  items-center justify-center">
          <Icon name={icon} size={iconSize} />
        </View>
      )}
      <View className="flex-1">
        <ThemedText className="text-lg font-semibold">{title}</ThemedText>
        {description && (
          <ThemedText className="text-sm">{description}</ThemedText>
        )}
      </View>
      {showChevron && (
        <View className="opacity-50">
          <Icon name={rightIcon} size={20} />
        </View>
      )}
    </View>
  )

  // If we have an href, make it a Link, otherwise a Pressable
  if (href && !disabled) {
    return (
      <Link asChild href={href}>
        <Pressable
          className={`w-full  ${hasBorder ? 'border-b border-border' : ''}`}
        >
          <Content />
        </Pressable>
      </Link>
    )
  }

  return (
    <Pressable
      className={` ${hasBorder ? 'border-b border-border' : ''}`}
      onPress={disabled ? undefined : onPress}
    >
      <Content />
    </Pressable>
  )
}

export default ListLink
