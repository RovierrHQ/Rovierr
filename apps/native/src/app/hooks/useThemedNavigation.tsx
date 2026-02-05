import useThemeColors from '@rov/app/contexts/ThemeColors'
import { useTheme } from '@rov/app/contexts/ThemeContext'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Platform } from 'react-native'

/**
 * A hook that handles theme-dependent styling for navigation and status bars
 * Returns configuration objects and components for themed navigation
 */
export default function useThemedNavigation() {
  const { theme } = useTheme()
  const colors = useThemeColors()
  const isDark = theme === 'dark'

  // Set up status/navigation bar styling based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set navigation bar color
      NavigationBar.setBackgroundColorAsync(colors.bg)
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark')

      // // Set status bar styling directly using the native StatusBar API
      // RNStatusBar.setBackgroundColor(colors.bg, true);
      // RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);

      // // Prevent translucency which can cause dimming
      // RNStatusBar.setTranslucent(true);
    }
  }, [isDark, colors.bg])

  // StatusBar component with appropriate theme styling
  const ThemedStatusBar = () => (
    <StatusBar
      backgroundColor="transparent"
      style={isDark ? 'light' : 'dark'}
      translucent={true}
    />
  )

  // Navigation container/stack screen options for themed backgrounds
  const screenOptions = {
    headerShown: false,
    backgroundColor: colors.bg,
    contentStyle: {
      backgroundColor: colors.bg
    }
  }

  return {
    ThemedStatusBar,
    screenOptions,
    colors,
    isDark,
    theme
  }
}
