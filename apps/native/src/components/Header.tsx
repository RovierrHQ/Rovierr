import { useThemeColors } from '@rov/app/contexts/ThemeColors'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { type Href, Link, router } from 'expo-router'
import type React from 'react'
import { useEffect, useRef } from 'react'
import {
  Animated,
  Platform,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon, { type IconName } from './Icon'
import ThemedText from './ThemedText'

type HeaderProps = {
  title?: string
  children?: React.ReactNode
  showBackButton?: boolean
  onBackPress?: () => void
  rightComponents?: React.ReactNode[]
  backgroundColor?: string
  textColor?: string
  leftComponent?: React.ReactNode
  middleComponent?: React.ReactNode
  className?: string
  style?: ViewStyle
  collapsible?: boolean
  visible?: boolean
  variant?: 'default' | 'transparent' | 'blurred'
}

const Header: React.FC<HeaderProps> = ({
  title,
  children,
  showBackButton = false,
  onBackPress,
  rightComponents = [],
  leftComponent,
  middleComponent,
  className,
  style,
  collapsible = false,
  visible = true,
  variant = 'default'
}) => {
  const colors = useThemeColors()
  const translateY = useRef(new Animated.Value(0)).current

  // Determine if we should use the transparent or blurred variant styling
  const isTransparent = variant === 'transparent'
  const isBlurred = variant === 'blurred'
  const insets = useSafeAreaInsets()
  useEffect(() => {
    if (!collapsible) return

    // When visible, use spring for a nice bounce-in from the top
    if (visible) {
      // First move it up slightly off-screen (if it's not already)
      translateY.setValue(-70)

      // Then spring it back in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 30, // Higher tension for faster movement
        friction: 50, // Lower friction for slight bounce
        velocity: 3 // Higher initial velocity for more dramatic entrance
      }).start()
    }
    // When hiding, use spring animation to slide up
    else {
      Animated.spring(translateY, {
        toValue: -150,
        useNativeDriver: true,
        tension: 80, // High tension for quick movement
        friction: 12, // Moderate friction for less bounce
        velocity: 2 // Initial velocity for natural feel
      }).start()
    }
  }, [visible, collapsible, translateY])

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  const AnimatedView = Animated.createAnimatedComponent(View)

  // Position absolute for collapsible or transparent/blurred variant
  const containerStyle =
    collapsible || isTransparent || isBlurred
      ? {
          transform: collapsible ? [{ translateY }] : undefined,
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }
      : {}

  if (isBlurred) {
    return (
      <BlurView
        className={`w-full pt-4  px-global z-50 bg-light-primary/60 dark:bg-dark-primary/80 ${className}`}
        intensity={30}
        style={[style, containerStyle, { paddingTop: insets.top }]}
        tint="light"
      >
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            {showBackButton && (
              <TouchableOpacity
                className="mr-global relative z-50"
                onPress={handleBackPress}
              >
                <Icon color="white" name="ArrowLeft" size={24} />
              </TouchableOpacity>
            )}

            <View className="flex-row items-center relative z-50">
              {leftComponent}

              {title && (
                <ThemedText className="text-lg font-bold">{title}</ThemedText>
              )}
            </View>
          </View>

          {middleComponent && (
            <View className="flex-row items-center absolute top-0 left-0 right-0 bottom-0 justify-center">
              {middleComponent}
            </View>
          )}

          <View className="flex-row items-center relative z-50">
            {rightComponents.map((component, index) => (
              <View className="ml-6" key={index}>
                {component}
              </View>
            ))}
          </View>
        </View>
        {children}
      </BlurView>
    )
  }

  if (isTransparent) {
    return (
      <LinearGradient
        className={`w-full pt-4 pb-10 px-global z-50 ${className}`}
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        end={{ x: 0, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[style, containerStyle, { paddingTop: insets.top }]}
      >
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            {showBackButton && (
              <TouchableOpacity
                className="mr-global relative z-50"
                onPress={handleBackPress}
              >
                <Icon color="white" name="ArrowLeft" size={24} />
              </TouchableOpacity>
            )}

            <View className="flex-row items-center relative z-50">
              {leftComponent}

              {title && (
                <Text className="text-white text-lg font-bold">{title}</Text>
              )}
            </View>
          </View>

          {middleComponent && (
            <View className="flex-row items-center absolute top-0 left-0 right-0 bottom-0 justify-center">
              {middleComponent}
            </View>
          )}

          <View className="flex-row items-center relative z-50">
            {rightComponents.map((component, index) => (
              <View className="ml-6" key={index}>
                {component}
              </View>
            ))}
          </View>
        </View>
        {children}
      </LinearGradient>
    )
  }

  return (
    <AnimatedView
      className={`w-full pb-2 flex-row justify-between px-global bg-background relative z-50 ${className}`}
      style={[
        collapsible
          ? { paddingTop: insets.top + 10 }
          : { paddingTop: insets.top + (Platform.OS === 'ios' ? 0 : 10) },
        style,
        containerStyle
      ]}
    >
      {(showBackButton || leftComponent || title) && (
        <View className="flex-row items-center flex-1">
          {showBackButton && (
            <TouchableOpacity
              className="mr-global relative z-50 py-4"
              onPress={handleBackPress}
            >
              <Icon
                color={isTransparent ? 'white' : colors.icon}
                name="ArrowLeft"
                size={24}
              />
            </TouchableOpacity>
          )}

          {leftComponent ||
            (title && (
              <View className="flex-row items-center relative z-50 py-4  ">
                {leftComponent}

                {title && (
                  <ThemedText className="text-lg font-bold">{title}</ThemedText>
                )}
              </View>
            ))}
        </View>
      )}
      {middleComponent && (
        <View className="flex-row items-center justify-center flex-1 py-4 ">
          {middleComponent}
        </View>
      )}

      {rightComponents.length > 0 && (
        <View className="flex-row items-center justify-end relative z-50 flex-1 ">
          {rightComponents.map((component, index) => (
            <View className="ml-6" key={index}>
              {component}
            </View>
          ))}
        </View>
      )}
      {children}
    </AnimatedView>
  )
}

export default Header

type HeaderItemProps = {
  href?: Href
  icon: IconName
  className?: string
  hasBadge?: boolean
  onPress?: () => void
  isWhite?: boolean
}

export const HeaderIcon = ({
  href,
  icon,
  hasBadge,
  onPress,
  className = '',
  isWhite = false
}: HeaderItemProps) => (
  <>
    {onPress ? (
      <TouchableOpacity className="overflow-visible" onPress={onPress}>
        <View
          className={`flex-row items-center justify-center relative overflow-visible h-7 w-7 ${className}`}
        >
          {hasBadge && (
            <View className="w-4 h-4 border-2 border-light-primary dark:border-dark-primary z-30 absolute -top-0 -right-0 bg-red-500 rounded-full" />
          )}
          {isWhite ? (
            <Icon color="white" name={icon} size={25} />
          ) : (
            <Icon name={icon} size={25} />
          )}
        </View>
      </TouchableOpacity>
    ) : (
      href && (
        <Link asChild href={href}>
          <TouchableOpacity className="overflow-visible">
            <View
              className={`flex-row items-center justify-center relative overflow-visible h-7 w-7 ${className}`}
            >
              {hasBadge && (
                <View className="w-4 h-4 border-2 border-background z-30 absolute -top-0 -right-[3px] bg-red-500 rounded-full" />
              )}
              {isWhite ? (
                <Icon color="white" name={icon} size={25} />
              ) : (
                <Icon name={icon} size={25} />
              )}
            </View>
          </TouchableOpacity>
        </Link>
      )
    )}
  </>
)
