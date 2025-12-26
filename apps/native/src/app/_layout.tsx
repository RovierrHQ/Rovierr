import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { useColorScheme } from '@native/hooks/use-color-scheme'
import { initLocalization } from '@rov/localization'
import { ActivityIndicator, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import '@native/global.css'
import { authClient } from '@native/lib/auth-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getLocales } from 'expo-localization'
import { useEffect, useState } from 'react'

export const unstable_settings = {
  initialRouteName: undefined // Don't set initial route, let auth state decide
}

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000)
    },
    mutations: {
      retry: 1,
      retryDelay: 1000
    }
  }
})

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { data: session, isPending } = authClient.useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === 'auth'
    const inTabsGroup = segments[0] === '(tabs)'
    const onWelcome = segments[0] === 'welcome'

    // Handle route protection
    if (!session && inTabsGroup) {
      router.replace('/welcome')
    } else if (session && (inAuthGroup || onWelcome)) {
      router.replace('/(tabs)/(profile)')
    }
  }, [session, isPending, segments, router])

  // Show loading screen while checking auth state
  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F7F7F7'
        }}
      >
        <ActivityIndicator color="#0C1824" size="large" />
      </View>
    )
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen
          name="auth"
          options={{
            presentation: 'formSheet'
          }}
        />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="spaces-selector"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.45]
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

export default function RootLayout() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    const locale = getLocales()[0]?.languageTag
    initLocalization(locale)
      .then(() => setIsI18nInitialized(true))
      .catch((e) => console.error('Failed to init localization', e))
  }, [])

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
