import type React from 'react'
import { useEffect } from 'react'
import { Platform, View } from 'react-native'
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated'
import ThemedText from './ThemedText'

type BarData = {
  month: string
  value: number
  isHighlighted?: boolean
}

type AnimatedBarChartProps = {
  data: BarData[]
  animate?: boolean
}

export const AnimatedBarChart: React.FC<AnimatedBarChartProps> = ({
  data,
  animate = true
}) => {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <View className="flex-row items-end justify-between px-4 py-6">
      {data.map((item, index) => (
        <AnimatedBar
          animate={animate}
          data={item}
          delay={index * 100}
          key={item.month}
          maxValue={maxValue}
        />
      ))}
    </View>
  )
}

type AnimatedBarProps = {
  data: BarData
  maxValue: number
  delay: number
  animate: boolean
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({
  data,
  maxValue,
  delay,
  animate
}) => {
  const heightAnim = useSharedValue(0)
  const opacityAnim = useSharedValue(0)

  useEffect(() => {
    if (animate) {
      // Use runOnUI for Android compatibility with New Architecture
      const startAnimation = () => {
        'worklet'
        heightAnim.value = 0
        opacityAnim.value = 0
        heightAnim.value = withDelay(delay, withTiming(1, { duration: 800 }))
        opacityAnim.value = withDelay(delay, withTiming(1, { duration: 600 }))
      }

      if (Platform.OS === 'android') {
        // Use runOnUI for better Android compatibility
        runOnUI(startAnimation)()
      } else {
        // Reset values first
        heightAnim.value = 0
        opacityAnim.value = 0
        // Animate height and opacity with delay
        heightAnim.value = withDelay(delay, withTiming(1, { duration: 800 }))
        opacityAnim.value = withDelay(delay, withTiming(1, { duration: 600 }))
      }
    } else {
      // Show immediately without animation
      heightAnim.value = 1
      opacityAnim.value = 1
    }
  }, [
    animate,
    delay, // Show immediately without animation
    heightAnim,
    opacityAnim
  ])

  const animatedStyle = useAnimatedStyle(() => {
    const targetHeight = (data.value / maxValue) * 200 // Max height of 200
    return {
      height: heightAnim.value * targetHeight,
      opacity: opacityAnim.value
    }
  })

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacityAnim.value
  }))

  return (
    <View className="flex-col items-center">
      <Animated.View className="mb-2" style={textAnimatedStyle} />
      <View className="h-[200px] justify-end">
        <Animated.View
          className={`w-12 rounded-full relative ${
            data.isHighlighted ? 'bg-highlight' : 'bg-text'
          }`}
          style={animatedStyle}
        >
          <ThemedText className="text-sm font-semibold text-center -mt-7">
            ${data.value}k
          </ThemedText>
        </Animated.View>
      </View>

      <View className="mt-3">
        <ThemedText className="text-sm font-medium">{data.month}</ThemedText>
      </View>
    </View>
  )
}
