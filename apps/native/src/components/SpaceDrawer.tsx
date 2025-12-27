import { Text } from '@native/components/ui/text'
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer'
import { Drawer } from 'expo-router/drawer'
import { View } from 'react-native'
import { Icon } from './ui/icon'
import type { IconProps } from './ui/icon/types'

export type DrawerItemType = {
  name: string // Route name (filename)
  label: string
  icon: IconProps
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
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text variant="title2">Current Space:</Text>
        <Text style={{ textTransform: 'capitalize' }} variant="title1">
          {spaceName}
        </Text>
      </View>
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
              <Icon color={color} size={22} {...item.icon} />
            )
          }}
        />
      ))}
      {children}
    </Drawer>
  )
}
