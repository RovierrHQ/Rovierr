import Feather from '@expo/vector-icons/Feather'
import { useTheme } from '@rov/contexts/ThemeContext'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const translateX = useSharedValue(isDark ? 36 : 3.5)

  useEffect(() => {
    translateX.value = withSpring(isDark ? 36 : 3.5, {
      damping: 15,
      stiffness: 150
    })
  }, [isDark, translateX])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    }
  })

  return (
    <Pressable
      className="w-20 h-10 p-1 bg-secondary relative flex-row rounded-full items-center justify-between"
      onPress={toggleTheme}
    >
      <Icon icon="sun" />
      <Icon icon="moon" />
      <Animated.View
        className="w-9 h-9 bg-background rounded-full items-center justify-center flex flex-row absolute"
        style={[animatedStyle]}
      />
    </Pressable>
  )
}

const Icon = (props: any) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <View className="w-9 h-9 relative z-50 rounded-full items-center justify-center flex flex-row">
      <Feather
        color={`${isDark ? 'white' : 'black'}`}
        name={props.icon}
        size={16}
      />
    </View>
  )
}

export default ThemeToggle
