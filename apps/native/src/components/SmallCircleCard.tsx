import { useFocusEffect } from '@react-navigation/native'
import useThemeColors from '@rov/app/contexts/ThemeColors'
import { shadowPresets } from '@rov/utils/useShadow'
import { useCallback, useRef } from 'react'
import { Animated, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Icon from './Icon'
import ThemedText from './ThemedText'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

type SmallCircleCardProps = {
  title: string
  subtitle?: string
  percentage: number // 0-100 percentage
  circleColor?: string
  backgroundColor?: string
  value?: string
  unit?: string
  size?: number
  // New comparison props
  comparison?: {
    category1: {
      name: string
      value: number
      color: string
    }
    category2: {
      name: string
      value: number
      color: string
    }
  }
}

export const SmallCircleCard = ({
  title,
  subtitle,
  percentage,
  circleColor,
  backgroundColor,
  value,
  unit,
  size = 80,
  comparison
}: SmallCircleCardProps) => {
  const colors = useThemeColors()

  // Animation
  const animatedValue = useRef(new Animated.Value(0)).current
  const _animatedValue2 = useRef(new Animated.Value(0)).current

  // Circle calculations
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate comparison percentages if comparison data exists
  const comparisonData = comparison
    ? (() => {
        const total = comparison.category1.value + comparison.category2.value
        const cat1Percentage =
          total > 0 ? (comparison.category1.value / total) * 100 : 0
        const cat2Percentage =
          total > 0 ? (comparison.category2.value / total) * 100 : 0
        return { cat1Percentage, cat2Percentage, total }
      })()
    : null

  const animateProgress = useCallback(() => {
    animatedValue.setValue(0)

    // Use the dominant category percentage for the main circle, or regular percentage
    const targetPercentage = comparisonData
      ? Math.max(comparisonData.cat1Percentage, comparisonData.cat2Percentage)
      : percentage

    Animated.timing(animatedValue, {
      toValue: targetPercentage,
      duration: 1500,
      useNativeDriver: false
    }).start()
  }, [animatedValue, percentage, comparisonData])

  useFocusEffect(
    useCallback(() => {
      animateProgress()
    }, [animateProgress])
  )

  return (
    <View
      className="bg-secondary rounded-2xl p-4 min-w-0"
      style={{ ...shadowPresets.medium }}
    >
      <ThemedText className="font-bold text-xl">{title}</ThemedText>
      {subtitle && (
        <ThemedText className="text-sm opacity-50">{subtitle}</ThemedText>
      )}

      {/* Circle Progress Chart */}
      <View className="items-center mt-4 mb-2">
        <View
          className="relative items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Svg height={size} style={{ position: 'absolute' }} width={size}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              fill="transparent"
              opacity={0.4}
              r={radius}
              stroke="#4ecdc4"
              strokeWidth={strokeWidth}
            />

            {/* Main progress circle - works for both single and comparison mode */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              fill="transparent"
              r={radius}
              stroke={
                comparisonData
                  ? (comparisonData.cat1Percentage >=
                    comparisonData.cat2Percentage
                      ? comparison?.category1.color
                      : comparison?.category2.color) || colors.highlight
                  : circleColor || colors.highlight
              }
              strokeDasharray={circumference}
              strokeDashoffset={animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: [circumference, 0]
              })}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>

          {/* Centered text */}
          <View className="items-center absolute">
            {comparisonData ? (
              <View className="items-center">
                <ThemedText className="text-xl font-bold">
                  {comparisonData.total}
                </ThemedText>
              </View>
            ) : (
              <ThemedText className="text-lg font-bold">
                {Math.round(percentage)}%
              </ThemedText>
            )}
          </View>
        </View>
      </View>

      {/* Legend for comparison mode */}
      {comparisonData && comparison && (
        <View className="flex-row justify-center gap-4 mb-2 mt-3">
          <View className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: comparison.category1.color }}
            />
            <ThemedText className="text-xs opacity-70">
              {comparison.category1.name} ({comparison.category1.value})
            </ThemedText>
          </View>
          <View className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: comparison.category2.color }}
            />
            <ThemedText className="text-xs opacity-70">
              {comparison.category2.name} ({comparison.category2.value})
            </ThemedText>
          </View>
        </View>
      )}

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
