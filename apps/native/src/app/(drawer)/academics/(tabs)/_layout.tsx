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
        <TabTrigger asChild href="/academics" name="index">
          <TabButton icon="Home" labelAnimated={true}>
            Today
          </TabButton>
        </TabTrigger>

        <TabTrigger asChild href="/academics/courses" name="courses">
          <TabButton icon="BookOpen" labelAnimated={true}>
            Courses
          </TabButton>
        </TabTrigger>

        <TabTrigger asChild href="/academics/texts" name="texts">
          <TabButton icon="MessageCircle" labelAnimated={true}>
            Texts
          </TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}
