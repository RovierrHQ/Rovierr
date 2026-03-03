import { useFocusEffect } from '@react-navigation/native'
import type React from 'react'
import { useCallback, useRef } from 'react'
import { Animated, Dimensions, View } from 'react-native'

type ProgressBarProps = {
  percentage: number
  height?: number
  backgroundColor?: string
  fillColor?: string
  className?: string
  rounded?: boolean
  duration?: number
  delay?: number
}

const { height: _ } = Dimensions.get('window')

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 8,
  backgroundColor = 'bg-black/20 dark:bg-dark-darker',
  fillColor = 'bg-highlight',
  className = '',
  rounded = true,
  duration = 1000,
  delay = 0
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current

  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  const startAnimation = useCallback(() => {
    // Reset animation value to 0
    animatedWidth.setValue(0)

    // Start animation with delay
    setTimeout(() => {
      Animated.timing(animatedWidth, {
        toValue: clampedPercentage,
        duration,
        useNativeDriver: false
      }).start()
    }, delay)
  }, [animatedWidth, clampedPercentage, duration, delay])

  // Trigger animation when screen gains focus
  useFocusEffect(
    useCallback(() => {
      startAnimation()
    }, [startAnimation])
  )

  return (
    <View
      className={`flex-1 w-full ${backgroundColor} ${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ height }}
    >
      <Animated.View
        className={`${fillColor} ${rounded ? 'rounded-full' : ''} h-full`}
        style={{
          width: animatedWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%']
          })
        }}
      />
    </View>
  )
}

export default ProgressBar
