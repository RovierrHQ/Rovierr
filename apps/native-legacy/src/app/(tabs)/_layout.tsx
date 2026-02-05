import { ProtectedRoute } from '@native/components/protected-route'
import { HapticTab } from '@native/components/ui/haptic-tab'
import { Icon } from '@native/components/ui/icon'
import { useTranslation } from '@rov/localization'
import { Tabs, useRouter } from 'expo-router'

export default function TabLayout() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
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
              <Icon
                color={color}
                materialIcon={{ name: 'dashboard' }}
                sfSymbol={{ name: 'square.grid.2x2.fill' }}
                size={28}
              />
            ),
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: t('common:notifications', 'Notifications'),
            tabBarIcon: ({ color }) => (
              <Icon color={color} name="bell.fill" size={28} />
            )
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: t('common:profile', 'Profile'),
            tabBarIcon: ({ color }) => (
              <Icon color={color} name="person.fill" size={28} />
            )
          }}
        />
      </Tabs>
    </ProtectedRoute>
  )
}
