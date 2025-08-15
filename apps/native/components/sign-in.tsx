import { useState } from 'react'
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { authClient } from '@/lib/auth-client'
import { queryClient } from '@/utils/orpc'

export function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    await authClient.signIn.email(
      {
        email,
        password
      },
      {
        onError: (err) => {
          setError(err.error?.message || 'Failed to sign in')
          setIsLoading(false)
        },
        onSuccess: () => {
          setEmail('')
          setPassword('')
          queryClient.refetchQueries()
        },
        onFinished: () => {
          setIsLoading(false)
        }
      }
    )
  }

  return (
    <View className="mt-6 rounded-lg border border-border bg-card p-4">
      <Text className="mb-4 font-semibold text-foreground text-lg">
        Sign In
      </Text>

      {error && (
        <View className="mb-4 rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive text-sm">{error}</Text>
        </View>
      )}

      <TextInput
        autoCapitalize="none"
        className="mb-3 rounded-md border border-input bg-input p-4 text-foreground"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
      />

      <TextInput
        className="mb-4 rounded-md border border-input bg-input p-4 text-foreground"
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
      />

      <TouchableOpacity
        className="flex-row items-center justify-center rounded-md bg-primary p-4"
        disabled={isLoading}
        onPress={handleLogin}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="font-medium text-primary-foreground">Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
