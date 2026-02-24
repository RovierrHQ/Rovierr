import { type Href, Link } from 'expo-router'
import type React from 'react'
import { forwardRef } from 'react'
import {
  Pressable,
  type PressableProps,
  View,
  type ViewStyle
} from 'react-native'
import Avatar from '../Avatar'
import Icon, { type IconName } from '../Icon'
import ThemedText from '../ThemedText'

type IconConfig = {
  name: IconName
  color?: string
  size?: number
  variant?: 'plain' | 'bordered' | 'contained'
  iconSize?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
}

interface ListItemProps extends PressableProps {
  avatar?: {
    src?: string
    name?: string
    size?: 'xs' | 'sm' | 'md'
  }
  className?: string
  disabled?: boolean
  href?: Href
  icon?: IconConfig
  leading?: React.ReactNode
  style?: ViewStyle
  subtitle?: React.ReactNode
  title: React.ReactNode
  trailing?: React.ReactNode
  trailingIcon?: IconConfig
}

const ListItem = forwardRef<View, ListItemProps>((props, ref) => {
  const {
    title,
    subtitle,
    leading,
    avatar,
    icon,
    trailing,
    trailingIcon,
    onPress,
    disabled = false,
    className = '',
    style,
    href,
    ...rest
  } = props

  const renderLeading = () => {
    if (leading) return leading
    if (avatar) return <Avatar {...avatar} size={avatar.size || 'sm'} />
    if (icon)
      return (
        <Icon
          color={icon.color}
          iconSize="m"
          name={icon.name}
          variant="bordered"
        />
      )
    return null
  }

  const renderTrailing = () => {
    if (trailing) return trailing
    if (trailingIcon) return <Icon {...trailingIcon} />
    return null
  }

  const hasLeading = leading || avatar || icon
  const hasTrailing = trailing || trailingIcon

  const itemContent = (
    <View
      className={`
                flex-row items-center
                ${disabled ? 'opacity-50' : ''}
                ${className}
            `}
      style={style}
    >
      {hasLeading && <View className="mr-3">{renderLeading()}</View>}

      <View className="flex-1">
        {typeof title === 'string' ? (
          <ThemedText className="text-base font-semibold">{title}</ThemedText>
        ) : (
          title
        )}
        {subtitle && (
          <ThemedText className="text-sm opacity-60">{subtitle}</ThemedText>
        )}
      </View>

      {hasTrailing && <View className="ml-4">{renderTrailing()}</View>}
    </View>
  )

  // If href is provided, use Link component
  if (href && !disabled) {
    return (
      <Link asChild href={href}>
        <Pressable className={'active:bg-secondary'} ref={ref} {...rest}>
          {itemContent}
        </Pressable>
      </Link>
    )
  }

  // Otherwise, use standard Pressable
  return (
    <Pressable
      className={` border-b border-border
                ${onPress ? 'active:bg-secondary' : ''}
            `}
      onPress={disabled ? undefined : onPress}
      ref={ref}
      {...rest}
    >
      {itemContent}
    </Pressable>
  )
})

ListItem.displayName = 'ListItem'

export default ListItem
