import '../global.css'
import { Sheets } from '@rov/components/Sheets'
import { Stack } from 'expo-router'
import { Platform } from 'react-native'
import { SheetProvider } from 'react-native-actions-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import useThemeColors from './contexts/ThemeColors'
import { ThemeProvider } from './contexts/ThemeContext'

export default function RootLayout() {
  const colors = useThemeColors()
  return (
    <GestureHandlerRootView
      className={`bg-background  ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`}
      style={{ flex: 1 }}
    >
      <ThemeProvider>
        <SheetProvider>
          <Sheets />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg }
            }}
          />
        </SheetProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
