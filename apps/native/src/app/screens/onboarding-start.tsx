import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import { router } from 'expo-router'
import { ImageBackground, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-background">
      <ImageBackground
        className="w-full h-full absolute top-0 left-0"
        source={require('@rov/assets/img/onboarding.jpg')}
      >
        <View className="flex-1 relative items-center justify-center">
          <ThemedText className="text-white text-4xl font-outfit-bold">
            Welcome, Thomino
          </ThemedText>
          <ThemedText className="text-white text-lg text-center px-20">
            We are excited to have you on board. Let's set up your account.
          </ThemedText>
        </View>
        {/* Login/Signup Buttons */}
        <View className="px-6 mb-6" style={{ bottom: insets.bottom }}>
          <View className="flex flex-row items-center justify-center gap-2">
            <Pressable
              className="flex-1 bg-highlight rounded-full flex flex-row items-center justify-center py-4"
              onPress={() => router.push('/screens/onboarding')}
            >
              <Text className="text-black text-lg font-semibold mr-4">
                Let's get started
              </Text>
              <Icon color="black" name="ArrowRight" size={20} />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}
