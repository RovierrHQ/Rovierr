import DateTimePicker from '@react-native-community/datetimepicker'
import useThemeColors from '@rov/app/contexts/ThemeColors'
import { Button } from '@rov/components/Button'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Platform,
  Pressable,
  TouchableOpacity,
  View
} from 'react-native'
import Modal from 'react-native-modal'
import type { InputVariant } from './Input'

type TimePickerProps = {
  value?: Date
  onChange: (date: Date) => void
  label?: string
  placeholder?: string
  error?: string
  is24Hour?: boolean
  disabled?: boolean
  containerClassName?: string
  variant?: InputVariant
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  error,
  is24Hour = false,
  disabled = false,
  containerClassName = '',
  variant = 'inline'
}) => {
  const [isTimePickerVisible, setTimePickerVisible] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(value || new Date())
  const [isFocused, setIsFocused] = useState(false)
  const colors = useThemeColors()
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    if (variant !== 'classic') {
      Animated.timing(animatedLabelValue, {
        toValue: isFocused || value ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      }).start()
    }
  }, [isFocused, value, animatedLabelValue, variant])

  const labelStyle = {
    top: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8]
    }),
    fontSize: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12]
    }),
    color: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.placeholder, colors.text]
    }),
    left: 12,
    paddingHorizontal: 8,
    position: 'absolute' as const,
    zIndex: 50,
    backgroundColor: colors.bg
  }

  const showTimePicker = () => {
    if (disabled) return
    setIsFocused(true)
    setTimePickerVisible(true)
  }

  const hideTimePicker = () => {
    setIsFocused(false)
    setTimePickerVisible(false)
  }

  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      hideTimePicker()
      if (selectedDate) {
        onChange(selectedDate)
      }
    } else if (selectedDate) {
      setTempDate(selectedDate)
    }
  }

  const handleConfirm = () => {
    onChange(tempDate)
    hideTimePicker()
  }

  const formattedTime = (date?: Date) => {
    if (!date) return ''
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour
    })
  }

  // Helper function to render time picker
  const renderTimePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          isVisible={isTimePickerVisible}
          onBackdropPress={hideTimePicker}
          style={{ margin: 0, justifyContent: 'flex-end' }}
        >
          <View
            className="rounded-t-xl items-center justify-center w-full"
            style={{ backgroundColor: colors.bg }}
          >
            <View
              className="flex-row justify-between items-center p-4 border-b w-full"
              style={{ borderBottomColor: colors.border }}
            >
              <Button
                onPress={hideTimePicker}
                textClassName="text-base font-normal"
                title="Cancel"
                variant="ghost"
              />
              <ThemedText className="text-lg font-medium">
                {label || 'Select Time'}
              </ThemedText>
              <Button
                onPress={handleConfirm}
                textClassName="text-base font-semibold"
                title="Done"
                variant="ghost"
              />
            </View>
            <DateTimePicker
              display="spinner"
              is24Hour={is24Hour}
              mode="time"
              onChange={handleTimeChange}
              style={{ backgroundColor: colors.bg }}
              themeVariant={colors.isDark ? 'dark' : 'light'}
              value={tempDate}
            />
          </View>
        </Modal>
      )
    }
    return (
      isTimePickerVisible && (
        <DateTimePicker
          display="default"
          is24Hour={is24Hour}
          mode="time"
          onChange={handleTimeChange}
          value={value || new Date()}
        />
      )
    )
  }

  if (variant === 'inline') {
    return (
      <View className={`mb-global relative ${containerClassName}`}>
        {label && (
          <ThemedText className="mb-2 font-medium absolute top-2 left-3 text-xs text-text opacity-60">
            {label}
          </ThemedText>
        )}
        <TouchableOpacity
          className={`border border-border bg-border rounded-lg px-3 h-16 pt-7 pr-10
            ${isFocused ? 'border-border' : 'border-border/60'}
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'opacity-50' : ''}`}
          disabled={disabled}
          onPress={showTimePicker}
        >
          <ThemedText className={value ? 'text-text' : 'text-text opacity-60'}>
            {value ? formattedTime(value) : placeholder}
          </ThemedText>
        </TouchableOpacity>
        <Pressable className="absolute right-3 top-[18px] z-10">
          <Icon color={colors.text} name="Clock" size={20} />
        </Pressable>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    )
  }

  if (variant === 'classic') {
    return (
      <View
        className={`mb-global relative ${containerClassName}`}
        style={{ position: 'relative' }}
      >
        {label && <ThemedText className="mb-2 font-medium">{label}</ThemedText>}
        <View className="relative">
          <TouchableOpacity
            className={`border bg-secondary rounded-lg px-3 h-14 pr-10 text-text
              ${isFocused ? 'border-border' : 'border-border/60'}
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50' : ''}`}
            disabled={disabled}
            onPress={showTimePicker}
          >
            <View className="flex-1 justify-center">
              <ThemedText
                className={value ? 'text-text' : 'text-text opacity-60'}
              >
                {value ? formattedTime(value) : placeholder}
              </ThemedText>
            </View>
          </TouchableOpacity>
          <Pressable className="absolute right-3 top-[18px] z-10">
            <Icon color={colors.text} name="Clock" size={20} />
          </Pressable>
        </View>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    )
  }

  if (variant === 'underlined') {
    return (
      <View
        className={`mb-global relative ${containerClassName}`}
        style={{ position: 'relative' }}
      >
        <View className="relative">
          <Pressable
            className="px-0 bg-secondary z-40"
            onPress={showTimePicker}
          >
            <Animated.Text
              className="text-black dark:text-white"
              style={[
                {
                  top: animatedLabelValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, -8]
                  }),
                  fontSize: animatedLabelValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 12]
                  }),
                  color: animatedLabelValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.placeholder, colors.text]
                  }),
                  left: 0,
                  paddingHorizontal: 0,
                  position: 'absolute',
                  zIndex: 50,
                  backgroundColor: colors.bg
                }
              ]}
            >
              {label}
            </Animated.Text>
          </Pressable>

          <TouchableOpacity
            className={`border-b-2 py-3 px-0 h-14 pr-10 text-text bg-transparent border-t-0 border-l-0 border-r-0
              ${isFocused ? 'border-border' : 'border-border'}
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50' : ''}`}
            disabled={disabled}
            onPress={showTimePicker}
          >
            <View className="flex-1 justify-center">
              <ThemedText className={value ? 'text-text' : 'transparent'}>
                {value ? formattedTime(value) : ''}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <Pressable className="absolute right-0 top-[18px] z-10">
            <Icon color={colors.text} name="Clock" size={20} />
          </Pressable>
        </View>

        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    )
  }

  return (
    <View className={`mb-8 relative ${containerClassName}`}>
      <Pressable
        className="z-40 px-1 bg-background"
        onPress={showTimePicker}
        style={{ position: 'absolute', left: -6, top: 0 }}
      >
        <Animated.Text className="bg-background text-text" style={[labelStyle]}>
          {label}
        </Animated.Text>
      </Pressable>

      <TouchableOpacity
        className={`border rounded-lg py-3 px-3 h-14 pr-10 text-text bg-transparent
          ${isFocused ? 'border-border' : 'border-border'}
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50' : ''}`}
        disabled={disabled}
        onPress={showTimePicker}
      >
        <View className="flex-1 justify-center">
          <ThemedText className={value ? 'text-text' : 'transparent'}>
            {value ? formattedTime(value) : ''}
          </ThemedText>
        </View>
      </TouchableOpacity>

      <Pressable className="absolute right-3 top-[18px] z-10">
        <Icon color={colors.text} name="Clock" size={20} />
      </Pressable>

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
      {renderTimePicker()}
    </View>
  )
}
