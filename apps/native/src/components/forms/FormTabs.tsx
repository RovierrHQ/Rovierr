import React, { useState } from 'react'
import { Pressable, View, type ViewStyle } from 'react-native'
import ThemedText from '../ThemedText'

type FormTabProps = {
  title: string
  isActive?: boolean
  onPress?: () => void
}

export function FormTab({ title, isActive, onPress }: FormTabProps) {
  return (
    <Pressable
      className={`flex-1 py-2.5 px-4 rounded-xl ${isActive ? 'bg-text shadow-lg' : 'bg-transparent'}`}
      onPress={onPress}
    >
      <ThemedText
        className={`text-center text-sm font-medium ${isActive ? '!text-invert' : 'text-text'}`}
      >
        {title}
      </ThemedText>
    </Pressable>
  )
}

type FormTabsProps = {
  children: React.ReactElement<FormTabProps>[]
  defaultActiveTab?: string
  onChange?: (tab: string) => void
  className?: string
  props?: any
  style?: ViewStyle
}

export default function FormTabs({
  children,
  defaultActiveTab,
  style,
  onChange,
  className = ''
}: FormTabsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || children[0].props.title
  )

  return (
    <View
      className={`flex-row p-1 bg-secondary rounded-xl overflow-hidden ${className}`}
      style={style}
    >
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          isActive: activeTab === child.props.title,
          onPress: () => {
            setActiveTab(child.props.title)
            onChange?.(child.props.title)
          }
        })
      })}
    </View>
  )
}
