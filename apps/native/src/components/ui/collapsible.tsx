import { ThemedText } from '@native/components/themed-text'
import { ThemedView } from '@native/components/themed-view'
import { IconSymbol } from '@native/components/ui/icon-symbol'
import { Colors } from '@native/constants/theme'
import { useColorScheme } from '@native/hooks/use-color-scheme'
import { type PropsWithChildren, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

export function Collapsible({
  children,
  title
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useColorScheme() ?? 'light'

  return (
    <ThemedView>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen((value) => !value)}
        style={styles.heading}
      >
        <IconSymbol
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          name="chevron.right"
          size={18}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          weight="medium"
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  content: {
    marginTop: 6,
    marginLeft: 24
  }
})
