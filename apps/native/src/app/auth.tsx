import { AntDesign } from '@expo/vector-icons'
import { authClient } from '@native/lib/auth-client'
import { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Rovierr</Text>
          <Text style={styles.subtitle}>
            Sign in to access your student ecosystem
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Google Sign In Button */}
        <TouchableOpacity
          disabled={isLoading}
          onPress={handleGoogleSignIn}
          style={styles.googleButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#0C1824" />
          ) : (
            <>
              <AntDesign color="#0C1824" name="google" size={24} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain'
  },
  header: {
    alignItems: 'center',
    marginBottom: 48
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C1824',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  errorContainer: {
    backgroundColor: '#FEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  errorText: {
    color: '#C00',
    fontSize: 14,
    textAlign: 'center'
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0C1824',
    marginBottom: 24
  },
  googleButtonText: {
    color: '#0C1824',
    fontSize: 16,
    fontWeight: '600'
  },
  termsContainer: {
    marginTop: 24,
    paddingHorizontal: 16
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18
  },
  termsLink: {
    textDecorationLine: 'underline'
  }
})
