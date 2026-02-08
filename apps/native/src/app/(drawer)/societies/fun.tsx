import AnimatedView from '@rov/components/AnimatedView'
import ThemedText from '@rov/components/ThemedText'
import ThemedScroller from '@rov/components/ThemeScroller'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SocietyFunScreen() {
  const insets = useSafeAreaInsets()
  return (
    <AnimatedView
      animation="scaleIn"
      className="flex-1 bg-background"
      duration={300}
    >
      <ThemedScroller className="pt-8 !px-2">
        <View className="w-full px-global" style={{ paddingTop: insets.top }}>
          <ThemedText className="text-text text-2xl font-semibold">
            Fun activities
          </ThemedText>
          <ThemedText className="text-text/60 text-base mt-2">
            Mini games and multiplayer activities.
          </ThemedText>
        </View>
      </ThemedScroller>
    </AnimatedView>
  )
}
