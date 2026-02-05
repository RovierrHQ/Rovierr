import {
  DrawerActions,
  type NavigationProp,
  useNavigation
} from '@react-navigation/native'
import { useThemeColors } from '@rov/app/contexts/ThemeColors'
import { Pressable, View, type ViewStyle } from 'react-native'
import Avatar from './Avatar'
import Icon from './Icon'

type DrawerButtonProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: ViewStyle
  isAvatar?: boolean
}

export default function DrawerButton({
  size = 'md',
  className,
  style,
  isAvatar = false
}: DrawerButtonProps) {
  const colors = useThemeColors()
  const navigation = useNavigation<NavigationProp<any>>()

  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  }

  const handlePress = () => {
    try {
      navigation.dispatch(DrawerActions.openDrawer())
    } catch (e) {
      console.warn('Drawer navigation context not available:', e)
    }
  }

  return (
    <View className={`rounded-full ${className}`} style={style}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        {isAvatar ? (
          <Avatar
            size="xs"
            src="https://mighty.tools/mockmind-api/content/human/5.jpg"
          />
        ) : (
          <Icon
            color={colors.text}
            name="ChartNoAxesGantt"
            size={sizeMap[size]}
          />
        )}
      </Pressable>
    </View>
  )
}
