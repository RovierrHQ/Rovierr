import { themes } from '@rov/utils/color-theme'
import { StatusBar } from 'expo-status-bar'
import { colorScheme } from 'nativewind'
import type React from 'react'
import { createContext, useContext, useState } from 'react'
import { View } from 'react-native'

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeContextType = {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {}
})

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark')

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    setCurrentTheme(newTheme)
    colorScheme.set(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <StatusBar
        backgroundColor="transparent"
        style={currentTheme === 'dark' ? 'light' : 'dark'}
        translucent={true}
      />
      <View className="flex-1 bg-background" style={themes[currentTheme]}>
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Default export for the ThemeProvider
export default ThemeProvider
