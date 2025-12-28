import '@native/global.css'
// import 'expo-dev-client'

import { ThemeProvider as NavThemeProvider } from '@react-navigation/native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { getItemAsync } from 'expo-secure-store'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { StripeDeepLinkHandler } from '@native/components/stripe-deep-link-handler'
import { StripeProvider } from '@native/components/stripe-provider'
import { authClient } from '@native/lib/auth-client'
import { useColorScheme } from '@native/lib/use-color-scheme'
import { NAV_THEME } from '@native/theme'
import { initLocalization } from '@rov/localization'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getLocales } from 'expo-localization'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

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
  const { colorScheme, isDarkColorScheme } = useColorScheme()
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
    <NavThemeProvider value={NAV_THEME[colorScheme]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen
          name="auth"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.45, 0.7, 0.9]
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
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
    </NavThemeProvider>
  )
}

export default function RootLayout() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedLanguage = await getItemAsync('user-language')
        const deviceLocale = getLocales()[0]?.languageTag
        const localeByPriority = savedLanguage || deviceLocale

        await initLocalization(localeByPriority)
        setIsI18nInitialized(true)
      } catch (e) {
        console.error('Failed to init app', e)
        // Fallback to basic init if something fails
        initLocalization('en').then(() => setIsI18nInitialized(true))
      }
    }

    initApp()
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
        <StripeProvider>
          <View style={{ flex: 1 }}>
            <StripeDeepLinkHandler />
            <RootLayoutNav />
          </View>
        </StripeProvider>
      </QueryClientProvider>
      <Toast />
    </GestureHandlerRootView>
  )
}
