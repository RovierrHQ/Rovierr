import '../global.css'
import { Sheets } from '@rov/components/Sheets'
import { Stack } from 'expo-router'
import { ActivityIndicator, Platform, View } from 'react-native'
import { SheetProvider } from 'react-native-actions-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import useThemeColors from '../contexts/ThemeColors'
import { ThemeProvider } from '../contexts/ThemeContext'
import { authClient } from '../lib/auth-client'

function AuthLayout() {
  const colors = useThemeColors()
  const { data: session, isPending } = authClient.useSession()

  const isAuthenticated = Boolean(session)

  if (isPending) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <ActivityIndicator color={colors.text} />
      </View>
    )
  }

  return (
    <SheetProvider>
      <Sheets />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg }
        }}
      >
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/signup" />
          <Stack.Screen name="(auth)/forgot-password" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="screens/add-post" />
          <Stack.Screen name="screens/analytics" />
          <Stack.Screen name="screens/edit-profile" />
          <Stack.Screen name="screens/help" />
          <Stack.Screen name="screens/languages" />
          <Stack.Screen name="screens/link" />
          <Stack.Screen name="screens/location-permission" />
          <Stack.Screen name="screens/notification-permission" />
          <Stack.Screen name="screens/notification-settings" />
          <Stack.Screen name="screens/onboarding-start" />
          <Stack.Screen name="screens/onboarding" />
          <Stack.Screen name="screens/post-detail" />
          <Stack.Screen name="screens/security" />
          <Stack.Screen name="screens/settings" />
          <Stack.Screen name="screens/subscription" />
          <Stack.Screen name="screens/user-profile" />
          <Stack.Screen name="screens/chat/[id]" />
          <Stack.Screen name="screens/chat/list" />
        </Stack.Protected>
      </Stack>
    </SheetProvider>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      className={`bg-background  ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`}
      style={{ flex: 1 }}
    >
      <ThemeProvider>
        <AuthLayout />
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
