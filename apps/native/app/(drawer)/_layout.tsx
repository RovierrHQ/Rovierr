import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { Drawer } from 'expo-router/drawer'

import { HeaderButton } from '@/components/header-button'

const DrawerLayout = () => {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: 'Home',
          drawerLabel: 'Home',
          drawerIcon: ({ size, color }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          )
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: 'Tabs',
          drawerLabel: 'Tabs',
          drawerIcon: ({ size, color }) => (
            <MaterialIcons color={color} name="border-bottom" size={size} />
          ),
          headerRight: () => (
            <Link asChild href="/modal">
              <HeaderButton />
            </Link>
          )
        }}
      />
    </Drawer>
  )
}

export default DrawerLayout
