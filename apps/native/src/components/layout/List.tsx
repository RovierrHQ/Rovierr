import React from 'react'
import { View, type ViewStyle } from 'react-native'

type ListProps = {
  children: React.ReactNode
  spacing?: number
  variant?: 'plain' | 'separated' | 'divided'
  className?: string
  style?: ViewStyle
}

export const List: React.FC<ListProps> = ({
  children,
  spacing = 0,
  variant = 'plain',
  className = '',
  style
}) => {
  // Convert children to array and filter out null/undefined
  const items = React.Children.toArray(children).filter(Boolean)

  const getVariantClass = () => {
    switch (variant) {
      case 'separated':
        return 'divide-y-0'
      case 'divided':
        return 'divide-y divide-black/10 dark:divide-white/10'
      default:
        return ''
    }
  }

  return (
    <View
      className={`
                ${getVariantClass()}
                ${className}
            `}
      style={[{ gap: spacing }, style]}
    >
      {items}
    </View>
  )
}

export default List
