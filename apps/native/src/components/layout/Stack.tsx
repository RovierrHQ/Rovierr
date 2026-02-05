import React from 'react'
import { View, type ViewStyle } from 'react-native'

type StackProps = {
  children: React.ReactNode
  spacing?: number
  direction?: 'vertical' | 'horizontal'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  className?: string
  style?: ViewStyle
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 4,
  direction = 'vertical',
  align = 'start',
  justify = 'start',
  className = '',
  style
}) => {
  // Convert children to array and filter out null/undefined
  const items = React.Children.toArray(children).filter(Boolean)

  const getAlignmentClass = () => {
    switch (align) {
      case 'center':
        return 'items-center'
      case 'end':
        return 'items-end'
      case 'stretch':
        return 'items-stretch'
      default:
        return 'items-start'
    }
  }

  const getJustifyClass = () => {
    switch (justify) {
      case 'center':
        return 'justify-center'
      case 'end':
        return 'justify-end'
      case 'between':
        return 'justify-between'
      case 'around':
        return 'justify-around'
      default:
        return 'justify-start'
    }
  }

  return (
    <View
      className={`
                ${direction === 'vertical' ? 'flex-col' : 'flex-row'}
                ${getAlignmentClass()}
                ${getJustifyClass()}
                ${className}
            `}
      style={[{ gap: spacing }, style]}
    >
      {items.map((child, index) => (
        <View key={index}>{child}</View>
      ))}
    </View>
  )
}

export default Stack
