import useThemeColors from '@rov/app/contexts/ThemeColors'
import React from 'react'
import { Pressable, View } from 'react-native'
import Icon from '../Icon'
import ThemedText from '../ThemedText'

type CheckboxProps = {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  error?: string
  className?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  error,
  className = ''
}) => {
  const _colors = useThemeColors()

  // Internal state if no onChange provided (for mockups)
  const [internalChecked, setInternalChecked] = React.useState(checked)

  // Use either the controlled prop or internal state
  const isChecked = onChange ? checked : internalChecked

  const handlePress = () => {
    if (onChange) {
      onChange(!isChecked)
    } else {
      setInternalChecked(!internalChecked)
    }
  }

  return (
    <View className={`mb-global ${className}`}>
      <Pressable className="flex-row items-center" onPress={handlePress}>
        <View
          className={`
          w-6 h-6 rounded border flex items-center justify-center
          ${isChecked ? 'bg-highlight' : 'border-border'}
          ${error ? 'border-red-500' : ''}
        `}
        >
          {isChecked && (
            <View className="w-full h-full bg-highlight rounded border-[2px] border-border items-center justify-center">
              <Icon color="#fff" name="Check" size={14} />
            </View>
          )}
        </View>
        <ThemedText className="ml-2">{label}</ThemedText>
      </Pressable>

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
    </View>
  )
}

export default Checkbox
