// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import type { SymbolViewProps, SymbolWeight } from 'expo-symbols'
import type { ComponentProps } from 'react'
import type { OpaqueColorValue, StyleProp, TextStyle } from 'react-native'

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'square.grid.2x2.fill': 'grid-view',
  'bell.fill': 'notifications',
  'person.fill': 'person',
  'book.fill': 'book',
  'doc.text.fill': 'description',
  'graduationcap.fill': 'school',
  'person.2.fill': 'group',
  'briefcase.fill': 'work',
  'building.columns.fill': 'account-balance',
  'hammer.fill': 'gavel',
  'plus.circle.fill': 'add-circle',
  'gearshape.fill': 'settings'
} as IconMapping
export type IconSymbolName = keyof typeof MAPPING

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style
}: {
  name: IconSymbolName
  size?: number
  color: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
  weight?: SymbolWeight
}) {
  return (
    <MaterialIcons
      color={color}
      name={MAPPING[name]}
      size={size}
      style={style}
    />
  )
}
