import { AntDesign } from '@expo/vector-icons'
import { Button } from '@rov/components/Button'
import Input from '@rov/components/forms/Input'
import ThemedText from '@rov/components/ThemedText'
import useThemeColors from '@rov/contexts/ThemeColors'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, Stack } from 'expo-router'
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
import { authClient } from '../../lib/auth-client'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const uppercaseRegex = /[A-Z]/
const lowercaseRegex = /[a-z]/
const numberOrSpecialRegex = /[0-9!@#$%^&*(),.?":{}|<>]/

export default function SignupScreen() {
  const insets = useSafeAreaInsets()
  const _colors = useThemeColors()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [strengthText, setStrengthText] = useState('')

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

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    const feedback = []

    // Length check
    if (password.length >= 8) {
      strength += 25
    } else {
      feedback.push('At least 8 characters')
    }

    // Uppercase check
    if (uppercaseRegex.test(password)) {
      strength += 25
    } else {
      feedback.push('Add uppercase letter')
    }

    // Lowercase check
    if (lowercaseRegex.test(password)) {
      strength += 25
    } else {
      feedback.push('Add lowercase letter')
    }

    // Numbers or special characters check
    if (numberOrSpecialRegex.test(password)) {
      strength += 25
    } else {
      feedback.push('Add number or special character')
    }

    setPasswordStrength(strength)
    setStrengthText(feedback.join(' • ') || 'Strong password!')
    return strength >= 75
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }
    const isStrong = checkPasswordStrength(password)
    if (!isStrong) {
      setPasswordError('Please create a stronger password')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required')
      return false
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match')
      return false
    }
    setConfirmPasswordError('')
    return true
  }

  const handleSignup = async () => {
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      setIsLoading(true)
      try {
        const nameFromEmail = email.split('@')[0] || 'User'
        const result = await authClient.signUp.email({
          name: nameFromEmail,
          email,
          password
        })

        if (result.error) {
          console.error('Signup error:', result.error)
          setPasswordError(result.error.message || 'Failed to create account')
          return
        }
      } catch (error) {
        console.error('Signup error:', error)
        setPasswordError('An error occurred during sign up')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const _handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const result = await authClient.signIn.social({
        provider
      })

      if (result.error) {
        setPasswordError(result.error.message || 'Social signup failed')
      }
    } catch (error) {
      console.error('Social signup error:', error)
      setPasswordError('An error occurred during social signup')
    }
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
                    <Link asChild href="/login">
                      <Pressable className="flex-1 bg-secondary p-3 rounded-2xl">
                        <ThemedText className="text-sm text-center">
                          Login
                        </ThemedText>
                      </Pressable>
                    </Link>
                    <Link asChild href="/signup">
                      <Pressable className="flex-1 bg-background p-3 rounded-xl">
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
                      checkPasswordStrength(text)
                      if (passwordError) validatePassword(text)
                    }}
                    value={password}
                    variant="animated"
                  />

                  <Input
                    autoCapitalize="none"
                    error={confirmPasswordError}
                    isPassword={true}
                    label="Confirm password"
                    onChangeText={(text) => {
                      setConfirmPassword(text)
                      if (confirmPasswordError) validateConfirmPassword(text)
                    }}
                    value={confirmPassword}
                    variant="animated"
                  />

                  {password.length > 0 && (
                    <View className="mb-4">
                      <View className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${passwordStrength >= 75 ? 'bg-green-500' : passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </View>
                      <ThemedText className="text-xs mt-1 opacity-50">
                        {strengthText}
                      </ThemedText>
                    </View>
                  )}

                  <Button
                    className="mb-4 !bg-highlight"
                    loading={isLoading}
                    onPress={handleSignup}
                    rounded="full"
                    size="large"
                    textClassName="!text-black"
                    title="Sign up"
                  />

                  <View className="flex-row gap-4  p-1.5 rounded-2xl mb-4">
                    <Pressable
                      className="flex-1 border border-white rounded-full flex flex-row items-center justify-center py-4"
                      onPress={() => _handleSocialLogin('google')}
                    >
                      <AntDesign color="white" name="google" size={22} />
                    </Pressable>

                    <Pressable
                      className="flex-1 border border-white rounded-full flex flex-row items-center justify-center py-4"
                      onPress={() => _handleSocialLogin('apple')}
                    >
                      <AntDesign color="white" name="apple" size={22} />
                    </Pressable>
                  </View>

                  <View className="flex-row justify-center">
                    <ThemedText className="text-sm opacity-50">
                      By signing up you agree to our Terms & Conditions
                    </ThemedText>
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
