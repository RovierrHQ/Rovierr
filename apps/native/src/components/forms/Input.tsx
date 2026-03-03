import useThemeColors from '@rov/app/contexts/ThemeColors'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Pressable,
  TextInput as RNTextInput,
  type TextInputProps,
  View
} from 'react-native'
import Icon, { type IconName } from '../Icon'
import ThemedText from '../ThemedText'

export type InputVariant = 'animated' | 'classic' | 'underlined' | 'inline'

interface CustomTextInputProps extends TextInputProps {
  className?: string
  containerClassName?: string
  error?: string
  inRow?: boolean
  isMultiline?: boolean
  isPassword?: boolean
  label?: string
  onRightIconPress?: () => void
  rightIcon?: IconName
  variant?: InputVariant
}

const Input: React.FC<CustomTextInputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  className = '',
  containerClassName = '',
  value,
  onChangeText,
  isMultiline = false,
  variant = 'classic',
  inRow = false,
  ...props
}) => {
  const colors = useThemeColors()
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [localValue, setLocalValue] = useState(value || '')
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current
  const inputRef = useRef<RNTextInput>(null)

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  // Handle label animation
  useEffect(() => {
    if (variant !== 'classic') {
      const hasValue = localValue !== ''
      Animated.timing(animatedLabelValue, {
        toValue: isFocused || hasValue ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      }).start()
    }
  }, [isFocused, localValue, animatedLabelValue, variant])

  const handleChangeText = (text: string) => {
    setLocalValue(text)
    onChangeText?.(text)
  }

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
    left: 12, // Consistent left padding
    paddingHorizontal: 8, // Consistent padding on both sides
    position: 'absolute' as const,
    zIndex: 50,
    backgroundColor: colors.bg
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Determine the right icon based on props and password state
  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <Pressable
          className={`absolute right-3 ${variant === 'classic' ? 'top-[16px]' : 'top-[18px]'} z-10`}
          onPress={togglePasswordVisibility}
        >
          <Icon
            color={colors.text}
            name={showPassword ? 'EyeOff' : 'Eye'}
            size={20}
          />
        </Pressable>
      )
    }

    if (rightIcon) {
      return (
        <Pressable
          className={`absolute right-3 ${variant === 'classic' ? 'top-[18px]' : 'top-[18px]'} z-10`}
          onPress={onRightIconPress}
        >
          <Icon color={colors.text} name={rightIcon} size={20} />
        </Pressable>
      )
    }

    return null
  }

  // Inline input with label as placeholder
  if (variant === 'inline') {
    return (
      <View className={`mb-global relative ${containerClassName}`}>
        {label && (
          <ThemedText className="font-medium  text-xs text-text opacity-60">
            {label}
          </ThemedText>
        )}
        <RNTextInput
          className={`border border-border bg-border rounded-lg px-3 ${isMultiline ? 'h-40 pt-4' : 'h-16 pt-6'} ${isPassword || rightIcon ? 'pr-10' : ''}
            text-text
            ${isFocused ? 'border-border' : 'border-border/60'}
            ${error ? 'border-red-500' : ''}
            ${className}`}
          multiline={isMultiline}
          numberOfLines={isMultiline ? 4 : 1}
          onBlur={() => setIsFocused(false)}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          placeholder={label}
          placeholderTextColor={colors.placeholder}
          ref={inputRef}
          secureTextEntry={isPassword && !showPassword}
          textAlignVertical={isMultiline ? 'top' : 'center'}
          value={localValue}
          {...props}
        />
        {renderRightIcon()}
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
      </View>
    )
  }

  // Classic non-animated input
  if (variant === 'classic') {
    return (
      <View
        className={`mb-4 relative ${containerClassName}`}
        style={{ position: 'relative' }}
      >
        {label && <ThemedText className="mb-2 font-medium">{label}</ThemedText>}
        <View className="relative">
          <RNTextInput
            className={`border bg-secondary rounded-lg  px-3 ${isMultiline ? 'h-36 pt-4' : 'h-14'} ${isPassword || rightIcon ? 'pr-10' : ''}
              text-text bg-transparent
              ${isFocused ? 'border-text' : 'border-text'}
              ${error ? 'border-red-500' : ''}
              ${className}`}
            multiline={isMultiline}
            numberOfLines={isMultiline ? 4 : 1}
            onBlur={() => setIsFocused(false)}
            onChangeText={handleChangeText}
            onFocus={() => setIsFocused(true)}
            placeholderTextColor={colors.placeholder}
            ref={inputRef}
            secureTextEntry={isPassword && !showPassword}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            value={localValue}
            {...props}
          />
          {renderRightIcon()}
        </View>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
      </View>
    )
  }

  // Underlined input with only bottom border
  if (variant === 'underlined') {
    return (
      <View
        className={`mb-global relative ${containerClassName}`}
        style={{ position: 'relative' }}
      >
        <View className="relative">
          <Pressable
            className="px-0 bg-secondary z-40"
            onPress={() => inputRef.current?.focus()}
          >
            <Animated.Text
              className="text-text font-semibold"
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
                  left: 0, // No left padding for underlined variant
                  paddingHorizontal: 0, // No horizontal padding
                  position: 'absolute',
                  zIndex: 50
                  //backgroundColor: colors.bg,
                }
              ]}
            >
              {label}
            </Animated.Text>
          </Pressable>

          <RNTextInput
            className={`border-b-2 py-3 px-0 ${isMultiline ? 'h-36 pt-4' : 'h-14'} ${isPassword || rightIcon ? 'pr-10' : ''}
              text-text bg-transparent border-t-0 border-l-0 border-r-0
              ${isFocused ? 'border-border' : 'border-border'}
              ${error ? 'border-red-500' : ''}
              ${className}`}
            multiline={isMultiline}
            numberOfLines={isMultiline ? 4 : 1}
            onBlur={() => setIsFocused(false)}
            onChangeText={handleChangeText}
            onFocus={() => setIsFocused(true)}
            placeholderTextColor="transparent"
            ref={inputRef}
            secureTextEntry={isPassword && !showPassword}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            value={localValue}
            {...props}
          />

          {renderRightIcon()}
        </View>

        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
      </View>
    )
  }

  // Default animated input (original)
  return (
    <View className={`mb-8 relative ${containerClassName}`}>
      <Pressable
        className="z-40 px-1 bg-background "
        onPress={() => inputRef.current?.focus()}
        style={{ position: 'absolute', left: -6, top: 0 }}
      >
        <Animated.Text className="bg-background text-text" style={[labelStyle]}>
          {label}
        </Animated.Text>
      </Pressable>

      <RNTextInput
        className={`border  rounded-lg py-3 px-3 ${isMultiline ? 'h-36 pt-4' : 'h-14'} ${isPassword || rightIcon ? 'pr-10' : ''}
            text-text bg-transparent
            ${isFocused ? 'border-border' : 'border-border'}
            ${error ? 'border-red-500' : ''}
            ${className}`}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 4 : 1}
        onBlur={() => setIsFocused(false)}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        placeholderTextColor="transparent"
        ref={inputRef}
        secureTextEntry={isPassword && !showPassword}
        textAlignVertical={isMultiline ? 'top' : 'center'}
        value={localValue}
        {...props}
      />

      {renderRightIcon()}

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
    </View>
  )
}

export default Input
