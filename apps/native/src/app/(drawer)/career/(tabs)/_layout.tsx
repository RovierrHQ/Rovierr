import { TabButton } from '@rov/components/TabButton'
import { useThemeColors } from '@rov/contexts/ThemeColors'
import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui'
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
        <TabTrigger asChild href="/career" name="index">
          <TabButton icon="Briefcase" labelAnimated={true}>
            Career
          </TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}
