import { ThemedText } from '@native/components/themed-text'
import { ThemedView } from '@native/components/themed-view'
import {
  IconSymbol,
  type IconSymbolName
} from '@native/components/ui/icon-symbol'
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer'
import { Drawer } from 'expo-router/drawer'

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
      {props.state.routes.map((route, index) => {
        const { options } = props.descriptors[route.key]
        const label =
          options.drawerLabel !== undefined
            ? options.drawerLabel
            : options.title !== undefined
              ? options.title
              : route.name

        const isFocused = props.state.index === index

        const onPress = () => {
          const event = props.navigation.emit({
            type: 'drawerItemPress',
            target: route.key,
            canPreventDefault: true
          })

          if (!(isFocused || event.defaultPrevented)) {
            props.navigation.navigate(route.name, route.params)
          }
        }

        return (
          <DrawerItem
            activeBackgroundColor={options.drawerActiveBackgroundColor}
            activeTintColor={options.drawerActiveTintColor}
            focused={isFocused}
            // biome-ignore lint/suspicious/noExplicitAny: React 19 type mismatch
            icon={options.drawerIcon as any}
            inactiveBackgroundColor={options.drawerInactiveBackgroundColor}
            inactiveTintColor={options.drawerInactiveTintColor}
            key={route.key}
            label={label as string}
            labelStyle={options.drawerLabelStyle}
            onPress={onPress}
            style={options.drawerItemStyle}
          />
        )
      })}
    </DrawerContentScrollView>
  )
}

export default function SpaceDrawer({
  spaceId,
  items,
  children
}: {
  spaceId: string
  items?: DrawerItemType[]
  children?: React.ReactNode
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
      {children}
    </Drawer>
  )
}
