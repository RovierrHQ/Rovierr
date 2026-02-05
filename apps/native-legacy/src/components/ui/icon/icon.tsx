import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useColorScheme } from '@native/lib/use-color-scheme'
import {
  SF_SYMBOLS_TO_MATERIAL_COMMUNITY_ICONS,
  SF_SYMBOLS_TO_MATERIAL_ICONS
} from 'rn-icon-mapper'
import type { IconProps } from './types'

function Icon({
  name,
  materialCommunityIcon,
  materialIcon,
  sfSymbol: _sfSymbol,
  size = 24,
  ...props
}: IconProps) {
  const { colors } = useColorScheme()
  const defaultColor = colors.foreground

  if (materialCommunityIcon) {
    return (
      <MaterialCommunityIcons
        color={defaultColor}
        size={size}
        {...props}
        {...materialCommunityIcon}
      />
    )
  }
  if (materialIcon) {
    return (
      <MaterialIcons
        color={defaultColor}
        size={size}
        {...props}
        {...materialIcon}
      />
    )
  }
  const materialCommunityIconName =
    SF_SYMBOLS_TO_MATERIAL_COMMUNITY_ICONS[
      name as keyof typeof SF_SYMBOLS_TO_MATERIAL_COMMUNITY_ICONS
    ]
  if (materialCommunityIconName) {
    return (
      <MaterialCommunityIcons
        color={defaultColor}
        name={materialCommunityIconName}
        size={size}
        {...props}
      />
    )
  }
  const materialIconName =
    SF_SYMBOLS_TO_MATERIAL_ICONS[
      name as keyof typeof SF_SYMBOLS_TO_MATERIAL_ICONS
    ]
  if (materialIconName) {
    return (
      <MaterialIcons
        color={defaultColor}
        name={materialIconName}
        size={size}
        {...props}
      />
    )
  }
  return (
    <MaterialCommunityIcons
      color={defaultColor}
      name="help"
      size={size}
      {...props}
    />
  )
}

export { Icon }
