import useThemeColors from '@rov/app/contexts/ThemeColors'
import { useTheme } from '@rov/app/contexts/ThemeContext'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import * as NavigationBar from 'expo-navigation-bar'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native'
import ActionSheet, { type ActionSheetRef } from 'react-native-actions-sheet'
import type { InputVariant } from './Input'

type SelectOption = {
  label?: string
  value: string | number
}

type SelectProps = {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string | number
  onChange: (value: string | number) => void
  error?: string
  disabled?: boolean
  className?: string
  containerClassName?: string
  style?: ViewStyle
  variant?: InputVariant
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select option',
  options,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  containerClassName = '',
  style,
  variant = 'inline'
}) => {
  const { theme } = useTheme()
  const colors = useThemeColors()
  const actionSheetRef = useRef<ActionSheetRef>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | undefined
  >(options.find((option) => option.value === value))

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(colors.bg)
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark')

      return () => {
        NavigationBar.setBackgroundColorAsync(colors.bg)
        NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark')
      }
    }
  }, [theme, colors.bg])

  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    if (variant !== 'classic') {
      Animated.timing(animatedLabelValue, {
        toValue: isFocused || selectedOption ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      }).start()
    }
  }, [isFocused, selectedOption, animatedLabelValue, variant])

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

  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option)
    onChange(option.value)
    actionSheetRef.current?.hide()
  }

  const handlePress = () => {
    if (disabled) return
    setIsFocused(true)
    actionSheetRef.current?.show()
  }

  const handleClose = () => {
    setIsFocused(false)
  }
  // Render the action sheet
  const renderActionSheet = () => (
    <ActionSheet
      animated={true}
      closeAnimationConfig={{
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true
      }}
      containerStyle={{
        backgroundColor: colors.bg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
      }}
      drawUnderStatusBar={false}
      enableGesturesInScrollView={true}
      id={`select-sheet-${value || 'default'}`}
      isModal={true}
      onClose={handleClose}
      openAnimationConfig={{
        stiffness: 3000,
        damping: 500,
        mass: 3,
        overshootClamping: true
      }}
      ref={actionSheetRef}
      statusBarTranslucent={true}
    >
      <View className="p-4">
        {options.map((option) => (
          <Pressable
            className={`py-3 px-4 rounded-lg mb-2 ${selectedOption?.value === option.value ? 'bg-secondary' : ''}`}
            key={option.value}
            onPress={() => handleSelect(option)}
          >
            <ThemedText>{option.label}</ThemedText>
          </Pressable>
        ))}
      </View>
    </ActionSheet>
  )

  if (variant === 'inline') {
    return (
      <View
        className={`mb-global relative ${containerClassName}`}
        style={style}
      >
        {label && (
          <ThemedText className="mb-2 font-medium absolute top-2 left-3 text-xs text-text opacity-60">
            {label}
          </ThemedText>
        )}
        <TouchableOpacity
          className={`bg-secondary rounded-lg px-global h-16 flex-row justify-between items-center
                        ${isFocused ? 'border-border' : 'border-border/60'}
                        ${error ? 'border-red-500' : ''}
                        ${disabled ? 'opacity-50' : ''}
                        ${className}`}
          disabled={disabled}
          onPress={handlePress}
        >
          <ThemedText
            className={
              selectedOption ? 'text-text text-base' : 'text-text text-base'
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </ThemedText>
          <Icon className="" color={colors.text} name="ChevronDown" size={20} />
        </TouchableOpacity>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderActionSheet()}
      </View>
    )
  }

  if (variant === 'classic') {
    return (
      <View
        className={`mb-global relative ${containerClassName}`}
        style={{ position: 'relative', ...style }}
      >
        {label && <ThemedText className="mb-2 font-medium">{label}</ThemedText>}
        <View className="relative">
          <TouchableOpacity
            className={`border bg-secondary rounded-lg px-3 h-14  text-text flex-row justify-between items-center
                            ${isFocused ? 'border-border' : 'border-border/60'}
                            ${error ? 'border-red-500' : ''}
                            ${disabled ? 'opacity-50' : ''}
                            ${className}`}
            disabled={disabled}
            onPress={handlePress}
          >
            <ThemedText
              className={selectedOption ? 'text-text' : 'text-text opacity-60'}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </ThemedText>
            <Icon color={colors.text} name="ChevronDown" size={20} />
          </TouchableOpacity>
        </View>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderActionSheet()}
      </View>
    )
  }

  if (variant === 'underlined') {
    return (
      <View
        className={`mb-global relative ${containerClassName}`}
        style={{ position: 'relative', ...style }}
      >
        <View className="relative">
          <Pressable className="px-0 bg-secondary z-40" onPress={handlePress}>
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
            className={`border-b-2 py-3 px-0 h-14 pr-10 text-text bg-transparent border-t-0 border-l-0 border-r-0 flex-row justify-between items-center
                            ${isFocused ? 'border-border' : 'border-border'}
                            ${error ? 'border-red-500' : ''}
                            ${disabled ? 'opacity-50' : ''}
                            ${className}`}
            disabled={disabled}
            onPress={handlePress}
          >
            <ThemedText
              className={selectedOption ? 'text-text' : 'transparent'}
            >
              {selectedOption ? selectedOption.label : ''}
            </ThemedText>
            <Icon color={colors.text} name="ChevronDown" size={20} />
          </TouchableOpacity>
        </View>

        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderActionSheet()}
      </View>
    )
  }

  return (
    <View className={`mb-8 relative ${containerClassName}`} style={style}>
      <Pressable
        className="z-40 px-1 bg-background"
        onPress={handlePress}
        style={{ position: 'absolute', left: -6, top: 0 }}
      >
        <Animated.Text className="bg-background text-text" style={[labelStyle]}>
          {label}
        </Animated.Text>
      </Pressable>

      <TouchableOpacity
        className={`border rounded-lg py-3 px-3 h-14 text-text bg-transparent flex-row justify-between items-center
                    ${isFocused ? 'border-border' : 'border-border'}
                    ${error ? 'border-red-500' : ''}
                    ${disabled ? 'opacity-50' : ''}
                    ${className}`}
        disabled={disabled}
        onPress={handlePress}
      >
        <ThemedText className={selectedOption ? 'text-text' : 'transparent'}>
          {selectedOption ? selectedOption.label : ''}
        </ThemedText>
        <Icon color={colors.text} name="ChevronDown" size={20} />
      </TouchableOpacity>

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
      {renderActionSheet()}
    </View>
  )
}

export default Select
