import { IconSymbol } from '@native/components/ui/icon-symbol'
import { BlurView } from 'expo-blur'
import { memo, useCallback } from 'react'
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { colors, shadows, spacing } from './styles'

type ActionIconsProps = {
  onSettingsPress: () => void
  onSharePress: () => void
  onEditPress: () => void
}

export const ActionIcons = memo(function ActionIcons({
  onSettingsPress,
  onSharePress,
  onEditPress
}: ActionIconsProps) {
  const handleLongPress = useCallback((action: string) => {
    Alert.alert('Action', `${action} - Tap to perform action`)
  }, [])

  return (
    <View style={styles.container}>
      <IconButton
        accessibilityHint="Opens profile settings"
        accessibilityLabel="Settings"
        iconName="gearshape.fill"
        onLongPress={() => handleLongPress('Settings')}
        onPress={onSettingsPress}
      />

      <IconButton
        accessibilityHint="Share your profile with others"
        accessibilityLabel="Share Profile"
        iconName="paperplane.fill"
        onLongPress={() => handleLongPress('Share Profile')}
        onPress={onSharePress}
      />

      <IconButton
        accessibilityHint="Edit your profile information"
        accessibilityLabel="Edit Profile"
        iconName="person.fill"
        onLongPress={() => handleLongPress('Edit Profile')}
        onPress={onEditPress}
      />
    </View>
  )
})

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
  <TouchableOpacity
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    onLongPress={onLongPress}
    onPress={onPress}
    style={styles.iconButton}
  >
    <BlurView intensity={20} style={styles.blurContainer}>
      <IconSymbol color="#FFFFFF" name={iconName} size={20} />
    </BlurView>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Account for status bar differences
    right: spacing[4],
    flexDirection: 'row',
    gap: spacing[2],
    zIndex: 10 // Ensure icons are above other content
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.base
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Platform.OS === 'ios'
        ? colors.overlayLight // iOS with blur
        : colors.overlay // Android without blur needs more opacity
  }
})
