import type React from 'react'
import { forwardRef } from 'react'
import { FlatList, type FlatListProps } from 'react-native'

// Define the props type, making it generic
export type ThemedFlatListProps<T> = FlatListProps<T> & {
  className?: string
}

// Use forwardRef to properly handle refs
function ThemedFlatListInner<T>(
  { className, ...props }: ThemedFlatListProps<T>,
  ref: React.Ref<FlatList<T>>
) {
  return (
    <FlatList
      bounces={true}
      className={`bg-background dark:bg-dark-primary flex-1 px-global ${className || ''}`}
      overScrollMode="never"
      ref={ref}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  )
}

// Create the forwardRef component with proper typing
const ThemedFlatList = forwardRef(ThemedFlatListInner) as <T>(
  props: ThemedFlatListProps<T> & { ref?: React.Ref<FlatList<T>> }
) => React.ReactElement

export default ThemedFlatList
