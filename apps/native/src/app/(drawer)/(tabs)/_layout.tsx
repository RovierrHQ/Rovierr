import Icon from '@rov/components/Icon'
import { TabButton } from '@rov/components/TabButton'
import { useThemeColors } from '@rov/contexts/ThemeColors'
import { router } from 'expo-router'
import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Layout() {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
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
        <TabTrigger asChild href="/" name="index">
          <TabButton icon="Home" labelAnimated={true}>
            Home
          </TabButton>
        </TabTrigger>

        <TabTrigger asChild href="/search" name="search">
          <TabButton icon="Search" labelAnimated={true}>
            Search
          </TabButton>
        </TabTrigger>

        <View className="w-1/5 items-center justify-center">
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
        </View>

        <TabTrigger asChild href="/notifications" name="notifications">
          <TabButton hasBadge icon="Bell" labelAnimated={true}>
            Notifications
          </TabButton>
        </TabTrigger>

        <TabTrigger asChild href="/profile" name="profile">
          <TabButton
            avatar={require('@rov/assets/img/thomino.jpg')}
            labelAnimated={true}
          >
            Profile
          </TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}
