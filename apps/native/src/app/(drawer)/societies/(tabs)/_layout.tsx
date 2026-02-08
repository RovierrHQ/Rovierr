import { TabButton } from '@rov/components/TabButton'
import { useSpace } from '@rov/contexts/SpaceContext'
import { useThemeColors } from '@rov/contexts/ThemeColors'
import {
  TabList,
  TabSlot,
  Tabs,
  TabTrigger,
  type TabTriggerSlotProps
} from 'expo-router/ui'
import { useRef } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Layout() {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const { openSocietySwitcher } = useSpace()
  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={{
          alignItems: 'center',
          backgroundColor: colors.bg,
          paddingBottom: insets.bottom
        }}
      >
        {/* Home Tab */}
        <TabTrigger asChild href="/societies" name="index">
          <TabButton icon="Home" labelAnimated={true}>
            Home
          </TabButton>
        </TabTrigger>

        <TabTrigger asChild href="/societies/search" name="search">
          <TabButton icon="Search" labelAnimated={true}>
            Search
          </TabButton>
        </TabTrigger>

        {/* <View className="w-1/5 items-center justify-center">
          <Pressable
            className="w-full"
            onPress={() => router.push('/screens/add-post')}
          >
            <Icon
              className="opacity-40"
              color={colors.text}
              name="SquarePlus"
              size={24}
            />
          </Pressable>
        </View> */}

        <TabTrigger
          asChild
          href="/societies/notifications"
          name="notifications"
        >
          <TabButton hasBadge icon="Bell" labelAnimated={true}>
            Notifications
          </TabButton>
        </TabTrigger>

        <TabTrigger asChild href="/societies/society" name="society">
          <SocietyTabButton onOpenSheet={openSocietySwitcher} />
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}

type SocietyTabButtonProps = TabTriggerSlotProps & {
  onOpenSheet: () => void
}

const SocietyTabButton = ({
  onOpenSheet,
  ...tabProps
}: SocietyTabButtonProps) => {
  const lastPressRef = useRef(0)
  const handlePress = (event: GestureResponderEvent) => {
    const now = Date.now()
    const isDoublePress = now - lastPressRef.current < 300
    lastPressRef.current = now
    if (isDoublePress) {
      onOpenSheet()
      return
    }
    tabProps.onPress?.(event)
  }

  return (
    <TabButton
      icon="Users"
      labelAnimated={true}
      {...tabProps}
      onPress={handlePress}
    >
      Society
    </TabButton>
  )
}
