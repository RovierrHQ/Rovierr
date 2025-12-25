import { useTranslation } from '@rovierr/localization'
import { Tabs, useRouter } from 'expo-router'
import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab
      }}
    >
      <Tabs.Screen
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              e.preventDefault()
              router.push('/spaces-selector')
            }
          }
        })}
        name="spaces"
        options={{
          title: t('common:spaces', 'Spaces'),
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="square.grid.2x2.fill" size={28} />
          ),
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('common:notifications', 'Notifications'),
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="bell.fill" size={28} />
          )
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t('common:profile', 'Profile'),
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="person.fill" size={28} />
          )
        }}
      />
    </Tabs>
  )
}
