import React, { type ReactNode, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native'
import AnimatedView from './AnimatedView'
import ThemedText from './ThemedText'

type ThemeTabsProps = {
  children: ReactNode
  headerComponent?: ReactNode
  footerComponent?: ReactNode
  type?: 'scrollview' | 'fixed'
  className?: string
  style?: ViewStyle
  scrollEnabled?: boolean
}

type ThemeTabProps = {
  name: string
  children: ReactNode
  type?: 'scrollview' | 'flatlist' | 'view'
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const ThemeTab: React.FC<ThemeTabProps> = ({ children }) => {
  return (
    <View className="" style={{ width: SCREEN_WIDTH, height: '100%' }}>
      {children}
    </View>
  )
}

const ThemeTabs: React.FC<ThemeTabsProps> = ({
  children,
  headerComponent,
  footerComponent,
  style,
  type = 'fixed',
  scrollEnabled = Platform.OS === 'ios'
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const tabContentRef = useRef<ScrollView>(null)
  const mainScrollRef = useRef<ScrollView>(null)

  // Filter out only ThemeTab components from children
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === ThemeTab
  )

  const handleTabPress = (index: number) => {
    setActiveTab(index)
    tabContentRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true
    })
  }

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  )

  const handleScrollEnd = (event: any) => {
    const position = event.nativeEvent.contentOffset.x
    const index = Math.round(position / SCREEN_WIDTH)
    setActiveTab(index)
  }

  // Calculate sticky header indices correctly based on whether headerComponent exists
  const stickyHeaderIndices = headerComponent ? [1] : [0]

  return (
    <View className="flex-1 bg-background dark:bg-dark-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={stickyHeaderIndices}
      >
        {/* Header Component - Will scroll up */}
        {headerComponent && <View>{headerComponent}</View>}

        {/* Tab Bar - This will be sticky */}
        <View className="z-10">
          {type === 'scrollview' ? (
            <ScrollView
              className="flex-row h-[48px] bg-background border-b border-border"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {tabs.map((tab, index) => {
                if (!React.isValidElement(tab)) return null
                return (
                  <Animated.View key={index}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="h-full px-4 items-center justify-center relative"
                      onPress={() => handleTabPress(index)}
                    >
                      <ThemedText
                        className={`text-base ${activeTab === index ? 'text-highlight' : ''}`}
                      >
                        {(tab as any).props?.name}
                      </ThemedText>
                      {activeTab === index && (
                        <View className="absolute bottom-0 h-[2px] w-full bg-highlight" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                )
              })}
            </ScrollView>
          ) : (
            <View className="flex-row h-[48px] bg-background border-b border-border">
              {tabs.map((tab, index) => {
                if (!React.isValidElement(tab)) return null
                return (
                  <Animated.View className="flex-1" key={index}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="flex-1 px-3 items-center justify-center relative"
                      onPress={() => handleTabPress(index)}
                    >
                      <ThemedText
                        className={`text-base ${activeTab === index ? 'text-highlight' : ''}`}
                      >
                        {(tab as any).props?.name}
                      </ThemedText>
                      {activeTab === index && (
                        <View className="absolute bottom-0 h-[2px] w-full bg-highlight" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                )
              })}
            </View>
          )}
        </View>

        {/* Tab Content - Horizontal scrollable area */}
        <View className="flex-1">
          {scrollEnabled ? (
            <ScrollView
              className="flex-1"
              horizontal
              onMomentumScrollEnd={handleScrollEnd}
              onScroll={handleScroll}
              pagingEnabled
              ref={tabContentRef}
              scrollEnabled={scrollEnabled}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
            >
              {tabs}
            </ScrollView>
          ) : (
            <AnimatedView
              animation="fadeIn"
              className="flex-1"
              duration={600}
              key={activeTab}
              style={{ width: SCREEN_WIDTH }}
            >
              {tabs[activeTab]}
            </AnimatedView>
          )}
        </View>

        {footerComponent && <View>{footerComponent}</View>}
      </ScrollView>
    </View>
  )
}

export default ThemeTabs
