import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { PressableScale } from 'pressto'
import { useCallback } from 'react'
import { Alert, View } from 'react-native'
import { Icon } from '../ui/icon'

export const ActionIcons = function ActionIcons() {
  const router = useRouter()

  const handleLongPress = useCallback((action: string) => {
    Alert.alert('Action', `${action} - Tap to perform action`)
  }, [])

  const handleSettingsPress = useCallback(() => {
    router.push('/(tabs)/(profile)/settings')
  }, [router])

  const handleSharePress = useCallback(() => {
    router.push('/(tabs)/(profile)/share')
  }, [router])

  const handleEditPress = useCallback(() => {
    router.push('/(tabs)/(profile)/edit-profile')
  }, [router])

  return (
    <View
      className="absolute bottom-2 right-2 flex-row gap-2"
      style={{ zIndex: 100 }}
    >
      <IconButton
        accessibilityHint="Opens profile settings"
        accessibilityLabel="Settings"
        iconName="gearshape.fill"
        onLongPress={() => handleLongPress('Settings')}
        onPress={handleSettingsPress}
      />

      <IconButton
        accessibilityHint="Share your profile with others"
        accessibilityLabel="Share Profile"
        iconName="paperplane.fill"
        onLongPress={() => handleLongPress('Share Profile')}
        onPress={handleSharePress}
      />

      <IconButton
        accessibilityHint="Edit your profile information"
        accessibilityLabel="Edit Profile"
        iconName="person.fill"
        onLongPress={() => handleLongPress('Edit Profile')}
        onPress={handleEditPress}
      />
    </View>
  )
}

const IconButton = ({
  iconName,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint
}: {
  iconName: 'gearshape.fill' | 'paperplane.fill' | 'person.fill'
  onPress: () => void
  onLongPress: () => void
  accessibilityLabel: string
  accessibilityHint: string
}) => (
  <PressableScale
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    onLongPress={onLongPress}
    onPress={onPress}
    style={{ zIndex: 101 }}
  >
    <View
      className="size-10 rounded-full overflow-hidden shadow-2xl"
      pointerEvents="box-none"
      style={{ zIndex: 101 }}
    >
      <BlurView
        intensity={20}
        pointerEvents="none"
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 101
        }}
        tint="dark"
      >
        <Icon color="#FFFFFF" name={iconName} size={20} />
      </BlurView>
    </View>
  </PressableScale>
)
