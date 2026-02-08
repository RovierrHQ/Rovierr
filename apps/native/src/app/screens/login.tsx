import { AntDesign } from '@expo/vector-icons'
import { Button } from '@rov/components/Button'
import Input from '@rov/components/forms/Input'
import ThemedText from '@rov/components/ThemedText'
import useThemeColors from '@rov/contexts/ThemeColors'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, router, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const _colors = useThemeColors()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleLogin = () => {
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        // Navigate to home screen after successful login
        router.replace('/societies')
      }, 1500)
    }
  }

  const _handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // Implement social login logic here
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'none'
        }}
      />
      <ImageBackground
        source={require('@rov/assets/img/wallpaper.webp')}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['transparent', 'transparent']}
          style={{ flex: 1 }}
        >
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <StatusBar style="light" />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1 justify-center w-full"
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <View className=" w-full flex-1">
                <View
                  className=" py-14 justify-center px-10"
                  style={{ paddingTop: insets.top + 100 }}
                >
                  <ThemedText className="text-4xl text-center font-outfit-bold">
                    Go ahead and set up your account
                  </ThemedText>
                  <ThemedText className="text-sm text-center opacity-50 mt-2">
                    Create an account to get started
                  </ThemedText>
                </View>
                <View
                  className="p-10 bg-background  rounded-3xl flex-1"
                  style={{ paddingBottom: insets.bottom }}
                >
                  <View className="flex-row gap-4 bg-secondary p-1.5 rounded-2xl mb-8">
                    <Link asChild href="/screens/login">
                      <Pressable className="flex-1 bg-background p-3 rounded-xl">
                        <ThemedText className="text-sm text-center">
                          Login
                        </ThemedText>
                      </Pressable>
                    </Link>
                    <Link asChild href="/screens/signup">
                      <Pressable className="flex-1 bg-secondary p-3 rounded-2xl">
                        <ThemedText className="text-sm text-center">
                          Signup
                        </ThemedText>
                      </Pressable>
                    </Link>
                  </View>

                  <Input
                    autoCapitalize="none"
                    autoComplete="email"
                    error={emailError}
                    keyboardType="email-address"
                    label="Email"
                    onChangeText={(text) => {
                      setEmail(text)
                      if (emailError) validateEmail(text)
                    }}
                    value={email}
                    variant="animated"
                  />

                  <Input
                    autoCapitalize="none"
                    error={passwordError}
                    isPassword={true}
                    label="Password"
                    onChangeText={(text) => {
                      setPassword(text)
                      if (passwordError) validatePassword(text)
                    }}
                    value={password}
                    variant="animated"
                  />
                  <Button
                    className="mb-4 !bg-highlight"
                    loading={isLoading}
                    onPress={handleLogin}
                    rounded="full"
                    size="large"
                    textClassName="!text-black"
                    title="Login"
                  />
                  <Link
                    className="underline text-center text-text text-sm mb-4"
                    href="/screens/forgot-password"
                  >
                    Forgot Password?
                  </Link>

                  <View className="flex flex-row items-center justify-center gap-2">
                    <Pressable
                      className="flex-1 border border-white rounded-full flex flex-row items-center justify-center py-4"
                      onPress={() => router.push('/screens/onboarding-start')}
                    >
                      <AntDesign color="white" name="google" size={22} />
                    </Pressable>

                    <Pressable
                      className="flex-1 border border-white rounded-full flex flex-row items-center justify-center py-4"
                      onPress={() => router.push('/screens/onboarding-start')}
                    >
                      <AntDesign color="white" name="apple" size={22} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </>
  )
}
