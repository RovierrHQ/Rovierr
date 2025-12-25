import { useRouter, useSegments } from 'expo-router'
import type React from 'react'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { authClient } from '@/lib/auth-client'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === 'auth'
    const inProtectedGroup = segments[0] === '(tabs)'

    if (!session && inProtectedGroup) {
      // Redirect to explore if trying to access protected routes without session
      router.replace('/welcome')
    } else if (session && inAuthGroup) {
      // Redirect to tabs if authenticated and trying to access auth screens
      router.replace('/(tabs)')
    }
  }, [session, isPending, segments, router])

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#0C1824" size="large" />
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7'
  }
})
