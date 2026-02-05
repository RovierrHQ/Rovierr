import type React from 'react'
import { useRef, useState } from 'react'
import {
  Animated,
  Platform,
  Pressable,
  UIManager,
  View,
  type ViewStyle
} from 'react-native'
import Icon, { type IconName } from './Icon'
import ThemedText from './ThemedText'

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

type ExpandableProps = {
  icon?: IconName
  title: string
  description?: string
  children?: React.ReactNode
  defaultExpanded?: boolean
  expanded?: boolean
  onPress?: () => void
  className?: string
  style?: ViewStyle
}

const Expandable: React.FC<ExpandableProps> = ({
  icon,
  title,
  description,
  children,
  defaultExpanded = false,
  expanded,
  onPress,
  className,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded ?? defaultExpanded)
  const rotateAnim = useRef(
    new Animated.Value((expanded ?? defaultExpanded) ? 1 : 0)
  ).current
  const heightAnim = useRef(
    new Animated.Value((expanded ?? defaultExpanded) ? 1 : 0)
  ).current

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1
    setIsExpanded(!isExpanded)
    onPress?.()

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false
      })
    ]).start()
  }

  return (
    <View className={`border-b border-border ${className}`} style={style}>
      <Pressable className="flex-row items-center py-6" onPress={toggleExpand}>
        {icon && (
          <View className="mr-4 h-12 w-12 rounded-full border border-border items-center justify-center">
            <Icon name={icon} size={20} />
          </View>
        )}
        <View className="flex-1">
          <ThemedText className="text-lg font-semibold">{title}</ThemedText>
          {description && (
            <ThemedText className="text-sm">{description}</ThemedText>
          )}
        </View>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                })
              }
            ]
          }}
        >
          <Icon name="ChevronDown" size={20} />
        </Animated.View>
      </Pressable>
      <Animated.View
        style={{
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000]
          }),
          opacity: heightAnim,
          overflow: 'hidden'
        }}
      >
        <View className="px-4 pb-4 pt-4">{children}</View>
      </Animated.View>
    </View>
  )
}

export default Expandable
