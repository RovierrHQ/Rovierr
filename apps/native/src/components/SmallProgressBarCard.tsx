import { useFocusEffect } from '@react-navigation/native'
import useThemeColors from '@rov/app/contexts/ThemeColors'
import { useCallback, useRef } from 'react'
import { Animated, View } from 'react-native'
import Icon from './Icon'
import ThemedText from './ThemedText'

type ProgressBarData = {
  percentage: number
  color?: string
  label?: string
}

type SmallProgressBarCardProps = {
  title: string
  subtitle?: string
  data: ProgressBarData[] | number // Support single number or array of bars
  barColor?: string
  backgroundColor?: string
  value?: string
  unit?: string
  height?: number
  barWidth?: number
}

export const SmallProgressBarCard = ({
  title,
  subtitle,
  data,
  barColor,
  backgroundColor,
  value,
  unit,
  height = 60,
  barWidth = 6
}: SmallProgressBarCardProps) => {
  const colors = useThemeColors()

  // Normalize data to array format
  const barsData = Array.isArray(data)
    ? data
    : [{ percentage: data, color: barColor }]

  // Animation values for each bar
  const animatedValues = useRef(
    barsData.map(() => new Animated.Value(0))
  ).current

  const animateProgress = useCallback(() => {
    // Reset all animations
    for (const anim of animatedValues) {
      anim.setValue(0)
    }

    // Animate bars with staggered timing
    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: barsData[index].percentage,
        duration: 1200,
        delay: index * 200,
        useNativeDriver: false
      })
    )

    Animated.parallel(animations).start()
  }, [animatedValues, barsData])

  useFocusEffect(
    useCallback(() => {
      animateProgress()
    }, [animateProgress])
  )

  return (
    <View className="bg-secondary rounded-lg p-4 min-w-0">
      <ThemedText className="font-bold text-xl">{title}</ThemedText>
      {subtitle && (
        <ThemedText className="text-sm opacity-50">{subtitle}</ThemedText>
      )}

      {/* Vertical Progress Bars */}
      <View className="items-center mt-4 mb-2">
        <View
          className="flex-row items-end justify-center gap-4"
          style={{ height: height + 20 }}
        >
          {barsData.map((bar, index) => (
            <View className="items-center" key={index}>
              {/* Progress Bar Container */}
              <View
                className="bg-background rounded-full relative overflow-hidden"
                style={{
                  width: barWidth,
                  height,
                  marginHorizontal: 4
                }}
              >
                {/* Animated Progress Fill */}
                <Animated.View
                  className="absolute bottom-0 left-0 right-0 rounded-full"
                  style={{
                    backgroundColor: bar.color || barColor || colors.highlight,
                    height: animatedValues[index].interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, height]
                    })
                  }}
                />
              </View>

              {/* Percentage Text Below Bar */}
              <View className="mt-2 min-h-6 justify-center">
                <ThemedText className="text-xs font-semibold text-center">
                  {Math.round(bar.percentage)}%
                </ThemedText>
                {bar.label && (
                  <ThemedText className="text-xs opacity-60 text-center">
                    {bar.label}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {value && (
        <View className="w-full pt-4 mt-2 border-t border-border flex-row justify-between">
          <View className="flex-row items-end">
            <ThemedText className="text-xl font-bold">{value}</ThemedText>
            <ThemedText className="text-sm opacity-50 ml-1 -translate-y-1">
              {unit}
            </ThemedText>
          </View>
          <Icon color={colors.text} name="ChevronRight" size={20} />
        </View>
      )}
    </View>
  )
}
