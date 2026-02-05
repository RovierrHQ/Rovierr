import { AntDesign } from '@expo/vector-icons'
import { Text } from '@native/components/ui/text'
import { authClient } from '@native/lib/auth-client'
import { useColorScheme } from '@native/lib/use-color-scheme'
import { useState } from 'react'
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native'

export default function AuthScreen() {
  const { colors } = useColorScheme()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const foregroundColor = colors.foreground

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/(tabs)'
      })

      if (result.error) {
        setError(
          result.error.message || 'Google sign-in failed. Please try again'
        )
        console.error('[Auth Error]', result.error)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('[Auth Error] Google sign-in error:', err)
      setError('An error occurred during Google sign in')
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1 p-6 justify-center">
        {/* Logo */}
        <View className="items-center mb-8 border border-red-500">
          <Image
            className="w-20 h-20 border border-red-500"
            source={require('../assets/images/icon.png')}
            style={{ resizeMode: 'contain', width: 50, height: 50 }}
          />
        </View>

        {/* Header */}
        <View className="items-center mb-12">
          <Text>Welcome to Rovierr</Text>
          <Text>Sign in to access your student ecosystem</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-destructive/10 p-3 rounded-lg mb-4">
            <Text>{error}</Text>
          </View>
        )}

        {/* Google Sign In Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-3 p-4 rounded-xl bg-card border-2 border-foreground mb-6"
          disabled={isLoading}
          onPress={handleGoogleSignIn}
        >
          {isLoading ? (
            <ActivityIndicator color={foregroundColor} />
          ) : (
            <>
              <AntDesign color={foregroundColor} name="google" size={24} />
              <Text>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <View className="mt-6 px-4">
          <Text>
            By continuing, you agree to our <Text>Terms of Service</Text> and{' '}
            Text <Text>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </View>
  )
}
