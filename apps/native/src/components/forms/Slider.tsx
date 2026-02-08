import useThemeColors from '@rov/contexts/ThemeColors'
import { useCallback, useEffect } from 'react'
import {
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import ThemedText from '../ThemedText'

type SliderSize = 's' | 'm' | 'l'

type SliderProps = {
  className?: string
  style?: StyleProp<ViewStyle>
  value?: number
  initialValue?: number
  onValueChange?: (value: number) => void
  label?: string
  maxValue?: number
  minValue?: number
  step?: number
  size?: SliderSize
}

const sizeStyles = {
  s: {
    containerHeight: 20,
    labelText: 'text-xs',
    valueText: 'text-xs',
    trackHeight: 4,
    thumbSize: 16
  },
  m: {
    containerHeight: 30,
    labelText: 'text-sm',
    valueText: 'text-sm',
    trackHeight: 6,
    thumbSize: 20
  },
  l: {
    containerHeight: 40,
    labelText: 'text-base',
    valueText: 'text-base',
    trackHeight: 8,
    thumbSize: 24
  }
}

const Slider = ({
  className = '',
  style,
  value,
  initialValue,
  onValueChange,
  label,
  maxValue = 100,
  minValue = 0,
  step = 1,
  size = 'm'
}: SliderProps) => {
  const colors = useThemeColors()
  const currentSize = sizeStyles[size]

  // This assures initialValue takes precedence when value is undefined
  const effectiveInitialValue = initialValue !== undefined ? initialValue : 0
  const effectiveValue = value !== undefined ? value : effectiveInitialValue

  // Calculate the width of the slider and track absolute positions
  const containerWidth = useSharedValue(0)

  // Percentage for positioning (0-1)
  const percentage = useSharedValue(
    maxValue === minValue
      ? 0
      : Math.max(
          0,
          Math.min(1, (effectiveValue - minValue) / (maxValue - minValue))
        )
  )

  // Calculate display value from percentage
  const displayValue = useDerivedValue(() => {
    return minValue + percentage.value * (maxValue - minValue)
  })

  // When external value changes, update our internal values
  useEffect(() => {
    if (value === undefined || maxValue === minValue) return

    const newPercentage = Math.max(
      0,
      Math.min(1, (value - minValue) / (maxValue - minValue))
    )
    percentage.value = withTiming(newPercentage, { duration: 100 })
  }, [value, minValue, maxValue, percentage])

  // Calculate actual thumb position accounting for thumb size to ensure edge-to-edge movement
  const thumbPosition = useDerivedValue(() => {
    // This creates perfect edge-to-edge movement
    const thumbRadius = currentSize.thumbSize / 2
    return (
      percentage.value * (containerWidth.value - currentSize.thumbSize) +
      thumbRadius
    )
  })

  // Calculate track width
  const trackWidth = useDerivedValue(() => {
    // Make track width relative to thumb center position
    return (
      percentage.value * (containerWidth.value - currentSize.thumbSize) +
      currentSize.thumbSize / 2
    )
  })

  // Track pan start for cumulative translation (Gesture API uses same semantics)
  const panStartPercentage = useSharedValue(0)

  // Pan gesture (Reanimated 4 + Gesture Handler 2: use Gesture.Pan, not useAnimatedGestureHandler)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartPercentage.value = percentage.value
    })
    .onUpdate((event) => {
      const usableWidth = containerWidth.value - currentSize.thumbSize
      if (usableWidth <= 0) return

      let newPercentage =
        panStartPercentage.value + event.translationX / usableWidth
      newPercentage = Math.min(Math.max(newPercentage, 0), 1)

      const rawValue = minValue + newPercentage * (maxValue - minValue)

      let steppedValue: number
      if (step > 0) {
        steppedValue =
          Math.round((rawValue - minValue) / step) * step + minValue
        steppedValue = Math.min(Math.max(steppedValue, minValue), maxValue)
        newPercentage = (steppedValue - minValue) / (maxValue - minValue)
      } else {
        steppedValue = rawValue
      }

      percentage.value = newPercentage

      if (onValueChange) {
        scheduleOnRN(onValueChange, steppedValue)
      }
    })

  // Thumb position style
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value - currentSize.thumbSize / 2 }]
  }))

  // Active track style
  const activeTrackStyle = useAnimatedStyle(() => ({
    width: trackWidth.value
  }))

  // Handle layout changes
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout
      if (width <= 0) return

      containerWidth.value = width

      // Initialize position based on value or initialValue
      if (maxValue !== minValue) {
        const valueToUse =
          value !== undefined
            ? value
            : initialValue !== undefined
              ? initialValue
              : 0
        const validPercentage = Math.max(
          0,
          Math.min(1, (valueToUse - minValue) / (maxValue - minValue))
        )
        percentage.value = validPercentage
      }
    },
    [containerWidth, value, initialValue, minValue, maxValue, percentage]
  )

  // Format display value with appropriate decimal points
  const formatValue = useDerivedValue(() => {
    const decimalPoints =
      step >= 1 ? 0 : String(step).split('.')[1]?.length || 0
    return displayValue.value.toFixed(decimalPoints)
  })

  // Tap on track: run on JS after worklet passes x (Gesture Handler 2 uses .x on event)
  const handleTapFromWorklet = useCallback(
    (x: number) => {
      const usableWidth = containerWidth.value - currentSize.thumbSize
      if (usableWidth <= 0) return

      let newPercentage = Math.max(
        0,
        Math.min(1, (x - currentSize.thumbSize / 2) / usableWidth)
      )

      const rawValue = minValue + newPercentage * (maxValue - minValue)

      let steppedValue: number
      if (step > 0) {
        steppedValue =
          Math.round((rawValue - minValue) / step) * step + minValue
        steppedValue = Math.min(Math.max(steppedValue, minValue), maxValue)
        newPercentage = (steppedValue - minValue) / (maxValue - minValue)
      } else {
        steppedValue = rawValue
      }

      percentage.value = withTiming(newPercentage, { duration: 150 })

      if (onValueChange) {
        onValueChange(steppedValue)
      }
    },
    [
      containerWidth,
      currentSize,
      maxValue,
      minValue,
      onValueChange,
      percentage,
      step
    ]
  )

  const tapGesture = Gesture.Tap().onStart((e) => {
    scheduleOnRN(handleTapFromWorklet, e.x)
  })

  return (
    <View className={`w-full ${className}`} style={style}>
      {label && (
        <View className="flex-row justify-between mb-2">
          <ThemedText className={currentSize.labelText}>{label}</ThemedText>
          <Animated.Text
            className={`text-text opacity-60 ${currentSize.valueText}`}
          >
            {formatValue.value}
          </Animated.Text>
        </View>
      )}

      <View
        className="justify-center"
        onLayout={onLayout}
        style={{ height: currentSize.containerHeight }}
      >
        <GestureDetector gesture={tapGesture}>
          <Animated.View className="w-full h-full justify-center">
            {/* Background Track */}
            <View
              style={{
                position: 'absolute',
                height: currentSize.trackHeight,
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: currentSize.trackHeight / 2,
                width: '100%'
              }}
            />

            {/* Active Track */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  height: currentSize.trackHeight,
                  backgroundColor: colors.highlight,
                  borderRadius: currentSize.trackHeight / 2
                },
                activeTrackStyle
              ]}
            />

            {/* Thumb */}
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: currentSize.thumbSize,
                    height: currentSize.thumbSize,
                    borderRadius: currentSize.thumbSize / 2,
                    backgroundColor: colors.highlight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    zIndex: 10
                  },
                  thumbStyle
                ]}
              />
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  )
}

export default Slider
