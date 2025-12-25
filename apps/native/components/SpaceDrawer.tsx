import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList
} from '@react-navigation/drawer'
import { Drawer } from 'expo-router/drawer'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol'

export type DrawerItemType = {
  name: string // Route name (filename)
  label: string
  icon: IconSymbolName
}

type CustomDrawerContentProps = DrawerContentComponentProps & {
  spaceName: string
}

function CustomDrawerContent({
  spaceName,
  ...props
}: CustomDrawerContentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <ThemedView style={{ padding: 20, paddingBottom: 10 }}>
        <ThemedText type="subtitle">Current Space:</ThemedText>
        <ThemedText
          style={{ textTransform: 'capitalize' }}
          type="defaultSemiBold"
        >
          {spaceName}
        </ThemedText>
      </ThemedView>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  )
}

export default function SpaceDrawer({
  spaceId,
  items
}: {
  spaceId: string
  items?: DrawerItemType[]
}) {
  return (
    <Drawer
      drawerContent={(props) => (
        <CustomDrawerContent {...props} spaceName={spaceId} />
      )}
      screenOptions={{
        headerShown: true
      }}
    >
      {items?.map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name}
          options={{
            drawerLabel: item.label,
            title: item.label,
            drawerIcon: ({ color }) => (
              <IconSymbol color={color} name={item.icon} size={22} />
            )
          }}
        />
      ))}
    </Drawer>
  )
}
