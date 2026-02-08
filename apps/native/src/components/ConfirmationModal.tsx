import ThemedText from '@rov/components/ThemedText'
import useThemeColors from '@rov/contexts/ThemeColors'
import { useTheme } from '@rov/contexts/ThemeContext'
import * as NavigationBar from 'expo-navigation-bar'
import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import ActionSheet, { type ActionSheetRef } from 'react-native-actions-sheet'

type ConfirmationModalProps = {
  isVisible: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  actionSheetRef: React.RefObject<ActionSheetRef>
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  actionSheetRef
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const colors = useThemeColors()

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(colors.bg)
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark')

      return () => {
        // Reset to default theme color when modal closes
        NavigationBar.setBackgroundColorAsync(colors.bg)
        NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark')
      }
    }
  }, [isDark, colors.bg])

  const handleConfirm = () => {
    actionSheetRef.current?.hide()
    onConfirm()
  }

  const handleCancel = () => {
    actionSheetRef.current?.hide()
    onCancel()
  }

  return (
    <ActionSheet
      containerStyle={{
        backgroundColor: colors.bg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
      }}
      drawUnderStatusBar={false}
      gestureEnabled={true}
      id="confirmation-modal"
      ref={actionSheetRef}
      statusBarTranslucent={true}
    >
      <View className="p-8 pb-14">
        <ThemedText className="text-xl font-bold mb-2">{title}</ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext mb-6">
          {message}
        </ThemedText>

        <View className="flex-row justify-between space-x-3">
          <Pressable
            className="px-4 py-3 flex-1 rounded-lg items-center bg-secondary  dark:bg-dark-secondary"
            onPress={handleCancel}
          >
            <ThemedText>{cancelText}</ThemedText>
          </Pressable>
          <Pressable
            className="px-4 py-3 flex-1 items-center rounded-lg bg-red-500"
            onPress={handleConfirm}
          >
            <Text className="text-white">{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </ActionSheet>
  )
}

export default ConfirmationModal
