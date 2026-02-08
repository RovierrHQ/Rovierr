import useThemeColors from '@rov/contexts/ThemeColors'
import { useState } from 'react'
import { View } from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import Icon from './Icon'
import ThemedText from './ThemedText'

type SmallChartCardProps = {
  title: string
  subtitle?: string
  data: number[]
  lineColor?: string
  backgroundColor?: string
  value?: string
  unit?: string
  height?: number
}

export const SmallChartCard = ({
  title,
  subtitle,
  data,
  lineColor,
  backgroundColor,
  value,
  unit,
  height = 83 // Default height
}: SmallChartCardProps) => {
  const colors = useThemeColors()
  const [containerWidth, setContainerWidth] = useState(200)

  // Calculate data range for better scaling
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const _range = maxValue - minValue

  // Control steepness through chart configuration rather than data transformation
  const heightFactor = 50 // Base height
  const currentHeight = height // Use the prop
  const heightRatio = currentHeight / heightFactor

  const chartData = {
    labels: data.map((_, _index) => ''), // Labels for actual data points only
    datasets: [
      {
        data, // Use original data - no transformation
        color: () => lineColor || colors.highlight,
        strokeWidth: 4
      }
    ]
  }

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: () => lineColor || colors.highlight,
    labelColor: () => 'transparent',
    style: {
      borderRadius: 0
    },
    propsForDots: {
      r: '4',
      strokeWidth: '1.4',
      fill: colors.secondary,
      stroke: lineColor || colors.highlight,
      strokeOpacity: 1
    },
    propsForBackgroundLines: {
      strokeWidth: 0
    },
    withHorizontalLabels: false,
    withVerticalLabels: false,
    withInnerLines: false,
    withOuterLines: false,
    fromZero: heightRatio < 1, // Use fromZero for smaller heights to create more Y-axis space
    segments: Math.max(2, Math.floor(height / 20)) // More segments = more Y-axis space = gentler slopes
  }

  return (
    <View
      className="bg-secondary rounded-lg p-4 min-w-0"
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout
        setContainerWidth(width - 32) // Subtract padding (16px each side)
      }}
    >
      <ThemedText className="font-bold text-xl">{title}</ThemedText>
      {subtitle && (
        <ThemedText className="text-sm opacity-50">{subtitle}</ThemedText>
      )}
      <View className="items-center mt-2">
        <LineChart
          chartConfig={chartConfig}
          data={chartData}
          height={height}
          style={{
            paddingRight: 10,
            paddingLeft: 0,
            marginLeft: 20
            // marginRight: 10,
          }}
          width={containerWidth + 20}
          withDots={true}
          withShadow={false}
        />
      </View>
      {value && (
        <View className="w-full pt-4 mt-6 border-t border-border flex-row justify-between">
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
