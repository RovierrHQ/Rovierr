import { useIsFocused } from '@react-navigation/native'
import React from 'react'
import { View } from 'react-native'
import type { AnimationType } from './AnimatedView'
import AnimatedView from './AnimatedView'

type TabScreenWrapperProps = {
  children: React.ReactNode
  animation?: AnimationType
  duration?: number
  delay?: number
  className?: string
}

export default function TabScreenWrapper({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  className
}: TabScreenWrapperProps) {
  const isFocused = useIsFocused()
  const [key, setKey] = React.useState(0)

  React.useEffect(() => {
    if (isFocused) {
      setKey((prev) => prev + 1)
    }
  }, [isFocused])

  return (
    <View className="bg-background dark:bg-dark-primary flex-1">
      <AnimatedView
        animation={animation}
        className={className}
        delay={delay}
        duration={duration}
        key={key}
        style={{ flex: 1 }}
      >
        {children}
      </AnimatedView>
    </View>
  )
}
