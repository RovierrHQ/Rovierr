import type React from 'react'
import { View, type ViewStyle } from 'react-native'

type SpacerProps = {
  size?: number
  orientation?: 'horizontal' | 'vertical'
  className?: string
  style?: ViewStyle
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 4,
  orientation = 'vertical',
  className = '',
  style
}) => {
  return (
    <View
      className={className}
      style={[
        {
          width: orientation === 'horizontal' ? size : 'auto',
          height: orientation === 'vertical' ? size : 'auto'
        },
        style
      ]}
    />
  )
}

export default Spacer
