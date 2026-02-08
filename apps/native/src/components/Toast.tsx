import useThemeColors from '@rov/contexts/ThemeColors'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

type ToastType = 'success' | 'error' | 'info' | 'warning'

type ToastProps = {
  message: string
  type?: ToastType
  duration?: number
  onHide?: () => void
  isVisible: boolean
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  isVisible
}) => {
  const colors = useThemeColors()
  const translateY = useRef(new Animated.Value(-100)).current

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50'
      case 'error':
        return '#F44336'
      case 'warning':
        return '#FFC107'
      default:
        return '#2196F3'
    }
  }

  useEffect(() => {
    if (isVisible) {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.delay(duration),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        if (onHide) {
          onHide()
        }
      })
    }
  }, [isVisible, duration, onHide, translateY])

  if (!isVisible) return null

  return (
    <Animated.View
      className="p-6"
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          shadowColor: colors.text
        }
      ]}
    >
      <View className="rounded-xl py-6 flex-row items-center justify-center bg-dark-primary dark:bg-light-primary">
        <View
          className="w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: getBackgroundColor() }}
        />
        <Text className="text-white dark:text-dark-primary">{message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 99_999_999,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16
  }
})

export default Toast
