import useThemeColors from '@rov/contexts/ThemeColors'
import type React from 'react'
import type { ReactNode } from 'react'
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native'
import AnimatedView from '../AnimatedView'
import Icon, { type IconName } from '../Icon'
import ThemedText from '../ThemedText'

type SelectableProps = {
  title: string
  description?: string
  icon?: IconName
  customIcon?: ReactNode
  iconColor?: string
  selected?: boolean
  onPress?: () => void
  error?: string
  className?: string
  containerClassName?: string
  style?: StyleProp<ViewStyle>
}

const Selectable: React.FC<SelectableProps> = ({
  title,
  description,
  icon,
  customIcon,
  iconColor,
  selected = false,
  onPress,
  error,
  className = '',
  containerClassName = '',
  style
}) => {
  const colors = useThemeColors()

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Pressable
        className={`
          border rounded-2xl p-4 active:opacity-70 bg-secondary
          ${selected ? 'border-highlight' : 'border-border'}
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        onPress={onPress}
        style={style}
      >
        <View className="flex-row items-center">
          {icon && (
            <View
              className={`mr-4 h-16 w-16 rounded-xl items-center justify-center ${selected ? 'bg-highlight' : 'bg-background'}`}
            >
              <Icon
                color={iconColor || (selected ? colors.invert : colors.icon)}
                name={icon}
                size={24}
                strokeWidth={1.5}
              />
            </View>
          )}
          {customIcon && (
            <View className="mr-4 h-12 w-12 rounded-xl items-center justify-center bg-secondary  dark:bg-dark-secondary">
              {customIcon}
            </View>
          )}
          <View className="flex-1">
            <ThemedText className="font-semibold text-base">{title}</ThemedText>
            {description && (
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-0">
                {description}
              </ThemedText>
            )}
          </View>
          {selected ? (
            <AnimatedView animation="bounceIn" className="ml-3" duration={500}>
              <Icon color={colors.highlight} name="CheckCircle2" size={24} />
            </AnimatedView>
          ) : null}
        </View>
      </Pressable>

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
    </View>
  )
}

export default Selectable
