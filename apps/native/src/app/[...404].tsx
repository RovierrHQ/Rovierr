import { Button } from '@rov/components/Button'
import Header from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import { Stack } from 'expo-router'
import { Dimensions, View } from 'react-native'

const _windowWidth = Dimensions.get('window').width
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen />
      <Header showBackButton title=" " />
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-primary p-global">
        <View className=" mb-8">
          <Icon name="AlertCircle" size={70} strokeWidth={1} />
        </View>
        <ThemedText className="text-2xl font-bold mb-2">
          Page Not Found
        </ThemedText>
        <ThemedText className="text-base w-2/3 text-center mb-8 text-light-subtext dark:text-dark-subtext">
          The page you're looking for doesn't exist or has been moved.
        </ThemedText>
        <View className="flex-row items-center justify-center">
          <Button
            className="px-6"
            href="/"
            size="medium"
            title="Back to Home"
          />
        </View>
      </View>
    </>
  )
}
