import { useThemeColors } from '@rov/contexts/ThemeColors'
import { Dimensions, View } from 'react-native'
import { LineChart } from 'react-native-chart-kit'

export const BalanceChart = () => {
  const { width } = Dimensions.get('window')
  const colors = useThemeColors()

  const followersData = [
    1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.1, 2.4, 2.7, 3.2, 3.6, 4.1, 4.5, 4.8, 5.2,
    5.7, 6.1, 6.8, 7.3, 7.9
  ]

  const chartData = {
    labels: [
      '1',
      '',
      '',
      '',
      '',
      '5',
      '',
      '',
      '',
      '',
      '10',
      '',
      '',
      '',
      '',
      '15',
      '',
      '',
      '',
      '',
      '20',
      '',
      '',
      '',
      '',
      '25',
      '',
      '',
      '',
      '',
      '30'
    ],
    datasets: [
      {
        data: followersData,
        color: () => colors.highlight,
        strokeWidth: 3
      }
    ]
  }

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 1,
    color: () => colors.highlight,
    labelColor: () => colors.text,
    style: {
      borderRadius: 0
    },
    fillShadowGradient: colors.highlight,
    fillShadowGradientOpacity: 0.25,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      fill: 'transparent',
      stroke: 'transparent'
    },

    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      strokeDasharray: ''
    },
    propsForVerticalLines: {
      strokeWidth: 0,
      stroke: 'transparent'
    },
    propsForHorizontalLines: {
      strokeWidth: 1,
      stroke: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)'
    },
    formatYLabel: (yValue: string) => `${yValue}k`,
    withHorizontalLabels: true,
    withVerticalLabels: true
  }

  return (
    <View className="">
      <View className="pl-2">
        <LineChart
          chartConfig={chartConfig}
          data={chartData}
          height={250}
          style={{
            borderRadius: 0,
            backgroundColor: 'transparent',
            marginLeft: -20
          }}
          width={width - 0}
          withDots={true}
          withHorizontalLabels={true}
          withInnerLines={true}
          withOuterLines={true}
          withShadow={true}
          withVerticalLabels={true}
          //bezier

          withVerticalLines={false}
        />
      </View>
    </View>
  )
}
