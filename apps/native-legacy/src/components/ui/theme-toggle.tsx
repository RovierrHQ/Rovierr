import { useColorScheme } from '@native/lib/use-color-scheme'
import { cn } from '@native/lib/utils'
import { COLORS } from '@native/theme/colors'
import { Pressable, View } from 'react-native'
import Animated, {
  LayoutAnimationConfig,
  ZoomInRotate
} from 'react-native-reanimated'
import { Icon } from './icon'

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme()
  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View
        className="items-center justify-center"
        entering={ZoomInRotate}
        key={`toggle-${colorScheme}`}
      >
        <Pressable className="opacity-80" onPress={toggleColorScheme}>
          {colorScheme === 'dark'
            ? ({ pressed }) => (
                <View className={cn('px-0.5', pressed && 'opacity-50')}>
                  <Icon color={COLORS.white} name="moon.stars" />
                </View>
              )
            : ({ pressed }) => (
                <View className={cn('px-0.5', pressed && 'opacity-50')}>
                  <Icon color={COLORS.black} name="sun.min" />
                </View>
              )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  )
}
