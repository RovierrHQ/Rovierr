import { Button } from '@rov/components/Button'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { View } from 'react-native'

export default function LocationPermissionScreen() {
  const _handleAllowLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      router.push('/(drawer)/(tabs)/')
    }
  }

  const handleSkip = () => {
    router.push('/(drawer)/(tabs)/')
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-primary p-6">
      <View className="flex-1 items-center justify-center px-10">
        <View className="w-24 h-24 bg-highlight rounded-2xl items-center justify-center mb-8">
          <Icon color="black" name="MapPinned" size={44} strokeWidth={2} />
        </View>
        <ThemedText className="text-4xl font-bold text-center mb-2 mt-8">
          Enable Location
        </ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext text-center mb-12">
          Allow access to your location to find nearby properties and get
          accurate recommendations
        </ThemedText>
      </View>

      <View className="gap-4">
        <Button
          className="!bg-highlight"
          onPress={handleSkip}
          rounded="full"
          size="large"
          textClassName="!text-black"
          title="Allow Location Access"
        />
        <Button
          onPress={handleSkip}
          size="large"
          title="Skip for Now"
          variant="ghost"
        />
      </View>
    </View>
  )
}
