import useThemeColors from '@rov/app/contexts/ThemeColors'
import type React from 'react'
import { View, type ViewStyle } from 'react-native'

type DividerProps = {
  orientation?: 'horizontal' | 'vertical'
  color?: string
  thickness?: number
  spacing?: number
  className?: string
  style?: ViewStyle
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  color,
  thickness = 1,
  spacing = 0,
  className = '',
  style
}) => {
  const colors = useThemeColors()
  const dividerColor = color || colors.border

  return (
    <View
      className={`
                ${orientation === 'horizontal' ? 'w-full' : 'h-full'}
                ${className}
            `}
      style={[
        {
          backgroundColor: dividerColor,
          height: orientation === 'horizontal' ? thickness : '100%',
          width: orientation === 'vertical' ? thickness : '100%',
          marginVertical: orientation === 'horizontal' ? spacing : 0,
          marginHorizontal: orientation === 'vertical' ? spacing : 0
        },
        style
      ]}
    />
  )
}

export default Divider
