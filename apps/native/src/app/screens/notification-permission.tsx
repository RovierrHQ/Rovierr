import { Button } from '@rov/components/Button'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import { router } from 'expo-router'
import { View } from 'react-native'

export default function NotificationPermissionScreen() {
  const handleSkip = () => {
    router.replace('/screens/location-permission')
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-primary p-6">
      <View className="flex-1 items-center justify-center px-10">
        <View className="w-24 h-24 bg-highlight rounded-2xl items-center justify-center mb-8">
          <Icon color="black" name="BellDot" size={44} strokeWidth={2} />
        </View>
        <ThemedText className="text-4xl font-bold text-center mb-2 mt-8">
          Enable Notifications
        </ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext text-center mb-12">
          Stay updated with property alerts, messages, and important updates
        </ThemedText>
      </View>

      <View className="gap-1">
        <Button
          className="!bg-highlight"
          onPress={handleSkip}
          rounded="full"
          size="large"
          textClassName="!text-black"
          title="Allow Notifications"
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
