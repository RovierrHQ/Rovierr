import AnimatedView from '@rov/components/AnimatedView'
import { Button } from '@rov/components/Button'
import Input from '@rov/components/forms/Input'
import ThemedText from '@rov/components/ThemedText'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

  const handleResetPassword = () => {
    const isEmailValid = validateEmail(email)

    if (isEmailValid) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        // Show success message
        Alert.alert(
          'Password Reset Link Sent',
          "We've sent a password reset link to your email address. Please check your inbox.",
          [{ text: 'OK', onPress: () => router.back() }]
        )
      }, 1500)
    }
  }

  return (
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
            <AnimatedView
              animation="slideInBottom"
              className=" w-full flex-1"
              delay={200}
              duration={500}
            >
              <View className=" py-14 flex-1 justify-center px-10">
                <ThemedText className="text-4xl text-center font-outfit-bold">
                  Reset your password
                </ThemedText>
                <ThemedText className="text-sm text-center opacity-50 mt-2">
                  Enter your email to receive a reset link
                </ThemedText>
              </View>
              <View
                className="p-10 bg-background  rounded-3xl flex-1"
                style={{ paddingBottom: insets.bottom }}
              >
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

                <Button
                  className="mb-4 !bg-highlight"
                  loading={isLoading}
                  onPress={handleResetPassword}
                  rounded="full"
                  size="large"
                  textClassName="!text-black"
                  title="Send Reset Link"
                />

                <Link
                  className="underline text-center text-text text-sm mb-4"
                  href="/screens/login"
                >
                  Back to Login
                </Link>
              </View>
            </AnimatedView>
          </KeyboardAvoidingView>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  )
}
