import { useFocusEffect } from '@react-navigation/native'
import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import { BalanceChart } from '@rov/components/BalanceChart'
import Header, { HeaderIcon } from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import Section from '@rov/components/layout/Section'
import { SmallChartCard } from '@rov/components/SmallChartCard'
import { SmallCircleCard } from '@rov/components/SmallCircleCard'
import ThemedText from '@rov/components/ThemedText'
import ThemedScroller from '@rov/components/ThemeScroller'
import { shadowPresets } from '@rov/utils/useShadow'
import React, { useCallback, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'

export default function AnalyticsScreen() {
  const [_shouldAnimate, setShouldAnimate] = useState(false)
  const userActionsSheetRef = useRef<ActionSheetRef>(null)
  const _engagementData = [
    { month: 'Mon', value: 12 },
    { month: 'Tue', value: 18 },
    { month: 'Wed', value: 24 },
    { month: 'Thu', value: 32, isHighlighted: true },
    { month: 'Fri', value: 28 },
    { month: 'Sat', value: 22 },
    { month: 'Sun', value: 26 }
  ]

  useFocusEffect(
    useCallback(() => {
      // Trigger animation when screen comes into focus
      setShouldAnimate(true)

      return () => {
        // Reset animation state when screen loses focus
        setShouldAnimate(false)
      }
    }, [])
  )

  return (
    <>
      <Header
        rightComponents={[
          <HeaderIcon
            icon="CalendarDays"
            key="calendar-days"
            onPress={() => userActionsSheetRef.current?.show()}
          />
        ]}
        showBackButton
      />
      <ThemedScroller className=" !px-0">
        <Section
          className="py-10 mb-4 px-global"
          style={{ ...shadowPresets.medium }}
          title="Analytics"
          titleSize="4xl"
        />
        <View className="mb-8">
          <BalanceChart />
        </View>

        <ChartCard />
      </ThemedScroller>
      <UserActionsSheet ref={userActionsSheetRef} />
    </>
  )
}

const UserActionsSheet = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="analytics-date-picker" ref={ref}>
      <View className="p-global">
        <View className="rounded-2xl bg-background mb-4">
          <SheetItem icon="ChevronRight" name="Last 7 days" />
          <SheetItem icon="ChevronRight" name="Last 30 days" />
          <SheetItem icon="ChevronRight" name="Last 90 days" />
          <SheetItem icon="ChevronRight" name="Last 180 days" />
        </View>
      </View>
    </ActionSheetThemed>
  )
})

const SheetItem = (props: any) => {
  return (
    <Pressable className="flex-row justify-between items-center  rounded-2xl p-4 border-b border-border">
      <ThemedText className="font-semibold text-base">{props.name}</ThemedText>
      <Icon name={props.icon} size={20} />
    </Pressable>
  )
}

const ChartCard = () => {
  return (
    <View className="items-center justify-between w-full gap-4 px-4 bg-background">
      <View className="flex-row items-center justify-between w-full gap-4">
        <View className="flex-1">
          <SmallChartCard
            data={[1200, 1350, 1500, 1800, 2100, 2300, 2400]}
            lineColor="#FF2056"
            subtitle="Likes"
            title="2.4K"
          />
        </View>
        <View className="flex-1">
          <SmallChartCard
            data={[450, 520, 680, 720, 780, 820, 856]}
            lineColor="#00CAE6"
            subtitle="Comments"
            title="856"
          />
        </View>
      </View>
      <View className="flex-row items-center justify-between w-full gap-4">
        <View className="flex-1">
          <SmallCircleCard
            comparison={{
              category1: {
                name: 'Photos',
                value: 12,
                color: '#4ecdc4'
              },
              category2: {
                name: 'Videos',
                value: 8,
                color: '#ff6b6b'
              }
            }}
            percentage={0}
            subtitle="This week" // Not used in comparison mode
            title="Post Types"
          />
        </View>
        <View className="flex-1">
          <SmallCircleCard
            comparison={{
              category1: {
                name: 'Likes',
                value: 245,
                color: '#4ecdc4'
              },
              category2: {
                name: 'Shares',
                value: 89,
                color: '#ff6b6b'
              }
            }}
            percentage={0}
            subtitle="This week" // Not used in comparison mode
            title="Engagement"
          />
        </View>
      </View>

      <View className="flex-row items-center justify-between w-full gap-4">
        <View className="flex-1">
          <SmallChartCard
            data={[2100, 2400, 2600, 2800, 3000, 3100, 3200]}
            lineColor="#10b981"
            subtitle="Profile views"
            title="3.2K"
          />
        </View>
        <View className="flex-1">
          <SmallChartCard
            data={[1200, 1300, 1450, 1500, 1600, 1700, 1800]}
            lineColor="#8b5cf6"
            subtitle="Story views"
            title="1.8K"
          />
        </View>
      </View>
    </View>
  )
}
