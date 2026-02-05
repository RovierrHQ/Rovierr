import { COLORS } from '@native/theme/colors'
import { useColorScheme as useNativewindColorScheme } from 'nativewind'

function useColorScheme() {
  const { colorScheme, setColorScheme } = useNativewindColorScheme()

  function toggleColorScheme() {
    return setColorScheme(colorScheme === 'light' ? 'dark' : 'light')
  }

  return {
    colorScheme: colorScheme ?? 'light',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[colorScheme ?? 'light']
  }
}

export { useColorScheme }
