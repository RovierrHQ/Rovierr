import { useIsFocused } from '@react-navigation/native'
import type React from 'react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  type EasingFunction,
  InteractionManager,
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle
} from 'react-native'

export type AnimationType =
  | 'fadeIn'
  | 'scaleIn'
  | 'slideInBottom'
  | 'slideInRight'
  | 'slideInLeft'
  | 'slideInTop'
  | 'bounceIn'
  | 'flipInX'
  | 'zoomInRotate'
  | 'rotateIn'

type AnimatedViewProps = {
  children?: React.ReactNode
  animation: AnimationType
  duration?: number
  delay?: number
  easing?: EasingFunction
  style?: StyleProp<ViewStyle>
  className?: string
  playOnlyOnce?: boolean
  triggerOnVisible?: boolean // Only animate when component becomes visible in viewport
  visibilityThreshold?: number // Pixels needed to be visible to trigger (default: 50)
}

// Function to compare props for pure rendering
const propsAreEqual = (
  prevProps: AnimatedViewProps,
  nextProps: AnimatedViewProps
) => {
  // Always re-render when in development mode to support hot reloading
  // biome-ignore lint/correctness/noUndeclaredVariables: provided by expo
  if (__DEV__) {
    return false
  }

  // In production, optimize rendering:
  // If animation, duration, delay, or easing changes, we should re-render
  if (
    prevProps.animation !== nextProps.animation ||
    prevProps.duration !== nextProps.duration ||
    prevProps.delay !== nextProps.delay ||
    prevProps.easing !== nextProps.easing
  ) {
    return false
  }

  // Basic check for children changes (reference equality)
  if (prevProps.children !== nextProps.children) {
    return false
  }

  // Check style prop changes
  if (prevProps.style !== nextProps.style) {
    return false
  }

  // Check className changes
  if (prevProps.className !== nextProps.className) {
    return false
  }

  // No changes detected, avoid re-render
  return true
}

function AnimatedViewComponent({
  children,
  animation,
  duration = 300,
  delay = 0,
  easing = Easing.bezier(0.4, 0, 0.2, 1),
  style,
  className,
  playOnlyOnce = false,
  triggerOnVisible = false,
  visibilityThreshold = 30 // Default to 50px visibility required
}: AnimatedViewProps) {
  const animatedValue = useRef(new Animated.Value(0)).current
  const isFocused = useIsFocused()
  const hasAnimatedOnce = useRef(false)
  const viewRef = useRef<View>(null)
  // Important: initial state is false if triggerOnVisible is true, otherwise we animate immediately
  const [isVisible, setIsVisible] = useState(false)
  const { height: windowHeight } = Dimensions.get('window')
  const measureInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const isFirstRender = useRef(true)
  // Function to check visibility by measuring the component
  const checkVisibility = useCallback(() => {
    if (!viewRef.current || hasAnimatedOnce.current) return

    // Clear any existing interval
    if (measureInterval.current) {
      clearInterval(measureInterval.current)
      measureInterval.current = null
    }

    // Start periodic measuring until visible
    measureInterval.current = setInterval(() => {
      if (!viewRef.current || hasAnimatedOnce.current) {
        if (measureInterval.current) {
          clearInterval(measureInterval.current)
        }
        return
      }

      // Measure component position relative to window
      viewRef.current.measure((_x, _y, _width, height, _pageX, pageY) => {
        // Calculate if it's in viewport (at least visibilityThreshold pixels visible)
        // Element is in view if its top is within screen bounds OR its bottom is within screen bounds
        const isElementVisible =
          // Either top of element is visible in viewport
          (pageY >= 0 && pageY <= windowHeight - visibilityThreshold) ||
          // OR bottom of element is visible in viewport
          (pageY + height >= visibilityThreshold &&
            pageY + height <= windowHeight) ||
          // OR element completely covers viewport
          (pageY < 0 && pageY + height > windowHeight)

        if (isElementVisible) {
          setIsVisible(true)
          if (measureInterval.current) {
            clearInterval(measureInterval.current)
            measureInterval.current = null
          }
        }
      })
    }, 0)
  }, [windowHeight, visibilityThreshold])

  // Initialize with visibility detection - but delayed to ensure proper measurement
  useEffect(() => {
    if (!triggerOnVisible) {
      // If not using visibility detection, just set to visible
      setIsVisible(true)
      return
    }

    // Important: For first render, ensure layout is complete before measuring
    // and we're actually checking visibility correctly
    if (isFirstRender.current) {
      isFirstRender.current = false

      // Wait for interactions to complete (navigation, etc)
      InteractionManager.runAfterInteractions(() => {
        // Slight delay to ensure component is fully mounted and measurable
        setTimeout(() => {
          checkVisibility()
        }, 0)
      })
    }

    return () => {
      if (measureInterval.current) {
        clearInterval(measureInterval.current)
      }
    }
  }, [triggerOnVisible, checkVisibility])

  // Handle layout to initialize position tracking
  const handleLayout = (_e: LayoutChangeEvent) => {
    if (!triggerOnVisible || hasAnimatedOnce.current) return

    // After layout, start visibility detection if not already started
    if (!(isVisible || measureInterval.current)) {
      checkVisibility()
    }
  }

  // Start animation when conditions are met
  useEffect(() => {
    // Skip if not focused or not visible
    if (!(isFocused && isVisible)) return

    // If playOnlyOnce is true and animation has played once, don't play again
    if (playOnlyOnce && hasAnimatedOnce.current) return

    // Add a unique identifier for this animation to prevent duplicate animations
    const animationId = Date.now()
    const currentAnimationId = animationId

    // Reset animation value
    animatedValue.setValue(0)

    // Start animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      easing,
      useNativeDriver: true
    }).start(({ finished }) => {
      // Only mark as animated if this is the most recent animation and it finished
      if (finished && currentAnimationId === animationId) {
        hasAnimatedOnce.current = true
      }
    })

    // Return cleanup function
    return () => {
      // Animation will be cleaned up automatically by React Native
    }
    // Restrict dependencies to only those that should trigger a re-animation
    // Specifically exclude anything related to parent component state like header visibility
  }, [
    isFocused,
    isVisible,
    playOnlyOnce,
    animatedValue,
    delay,
    duration,
    easing
  ])

  const getAnimationStyle = () => {
    const baseStyle: ViewStyle = {}

    switch (animation) {
      case 'fadeIn':
        return {
          opacity: animatedValue
        }

      case 'scaleIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1]
              })
            }
          ]
        }

      case 'slideInBottom':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            }
          ]
        }

      case 'slideInRight':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            }
          ]
        }

      case 'slideInLeft':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })
            }
          ]
        }

      case 'slideInTop':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })
            }
          ]
        }

      case 'bounceIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.6, 0.8, 1],
                outputRange: [0.3, 1.1, 0.9, 1]
              })
            }
          ]
        }

      case 'flipInX':
        return {
          opacity: animatedValue,
          transform: [
            {
              rotateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['90deg', '0deg']
              })
            }
          ]
        }

      case 'zoomInRotate':
        return {
          //opacity: animatedValue,
          transform: [
            {
              rotate: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['-45deg', '0deg']
              })
            }
          ]
        }

      case 'rotateIn':
        return {
          //opacity: animatedValue,
          transform: [
            {
              rotate: animatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['0deg', '50deg', '0deg']
              })
            }
          ]
        }

      default:
        return baseStyle
    }
  }

  // Initial style for elements waiting to be visible
  const initialHiddenStyle: ViewStyle =
    triggerOnVisible && !isVisible
      ? {
          opacity: 0 // Keep element hidden until it's ready to animate
        }
      : {}

  return (
    <View
      className={className}
      collapsable={false}
      onLayout={handleLayout}
      ref={viewRef}
      style={[style, initialHiddenStyle]}
    >
      <Animated.View className={className} style={[getAnimationStyle(), style]}>
        {children}
      </Animated.View>
    </View>
  )
}

// Export a memoized version of the component
export default memo(AnimatedViewComponent, propsAreEqual)
