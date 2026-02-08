import useThemeColors from '@rov/contexts/ThemeColors'
import { ActivityIndicator, View } from 'react-native'
import ThemedText from './ThemedText'

type PageLoaderProps = {
  text?: string
}

export default function PageLoader({ text }: PageLoaderProps) {
  const colors = useThemeColors()

  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-dark-primary">
      <ActivityIndicator color={colors.highlight} size="large" />
      {text && (
        <ThemedText className="mt-4 text-light-subtext dark:text-dark-subtext">
          {text}
        </ThemedText>
      )}
    </View>
  )
}
