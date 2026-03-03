import { useThemeColors } from '@rov/app/contexts/ThemeColors'
import Icon, { type IconName } from '@rov/components/Icon'
import type { TabTriggerSlotProps } from 'expo-router/ui'
import { forwardRef, type ReactNode, useEffect, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import Avatar from './Avatar'
import ThemedText from './ThemedText'

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: IconName
  avatar?: string
  customContent?: ReactNode
  labelAnimated?: boolean
  hasBadge?: boolean
}

export const TabButton = forwardRef<View, TabButtonProps>(
  (
    {
      icon,
      avatar,
      children,
      isFocused,
      onPress,
      customContent,
      labelAnimated = true,
      hasBadge = false,
      ...props
    },
    ref
  ) => {
    const colors = useThemeColors()

    // Use Animated Values to control opacity and translateY
    const [labelOpacity] = useState(new Animated.Value(isFocused ? 1 : 0))
    const [labelMarginBottom] = useState(new Animated.Value(isFocused ? 0 : 10))
    const [lineScale] = useState(new Animated.Value(isFocused ? 0 : 10))

    // Animate opacity and translation when the tab becomes focused or unfocused
    useEffect(() => {
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(labelMarginBottom, {
          toValue: isFocused ? 0 : 10,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(lineScale, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
    }, [isFocused, labelMarginBottom, labelOpacity, lineScale])

    // Render icon or custom content
    const renderContent = () => {
      if (customContent) {
        return customContent
      }

      if (icon) {
        return (
          <View className="relative">
            <View
              className={`w-full relative ${isFocused ? 'opacity-100' : 'opacity-40'}`}
            >
              {/*isFocused && (
                <AnimatedView animation='scaleIn' duration={200} className='absolute border-4 rounded-full border-light-primary dark:border-dark-primary -top-1 -left-1/3  w-full h-8  bg-highlight/20' ></AnimatedView>
              )}*/}
              <Icon
                color={isFocused ? colors.text : colors.icon}
                name={icon}
                size={24}
                strokeWidth={isFocused ? 2.5 : 2}
              />
            </View>
            {hasBadge && (
              <View className="absolute w-3 h-3 rounded-full bg-red-500 -top-1 -right-1.5" />
            )}
          </View>
        )
      }
      if (avatar) {
        return (
          <View
            className={`rounded-full border-2 ${isFocused ? 'border-highlight' : 'border-transparent'}`}
          >
            <Avatar size="xxs" src={avatar} />
          </View>
        )
      }
      return null
    }

    return (
      <Pressable
        className={`w-1/5 overflow-hidden ${isFocused ? '' : ''}`}
        ref={ref}
        {...props}
        onPress={onPress}
      >
        <View className="flex-col items-center justify-center pt-4 pb-0 w-full relative">
          {/*<Animated.View className="absolute w-full h-[2px] bg-black dark:bg-white left-0 top-0"
            style={{
              opacity: lineScale,
              transform: [{ scaleX: lineScale }],
            }}
          />*/}

          {renderContent()}

          {labelAnimated ? (
            <Animated.View
              className="relative"
              style={{
                opacity: labelOpacity,
                transform: [{ translateY: labelMarginBottom }]
              }}
            >
              <Text className={'text-[9px] mt-px text-text'}>{children}</Text>
            </Animated.View>
          ) : (
            <ThemedText className={'text-[9px] mt-px'}>{children}</ThemedText>
          )}
        </View>
      </Pressable>
    )
  }
)
