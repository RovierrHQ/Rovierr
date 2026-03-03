import SpaceDrawer, {
  type DrawerItemType
} from '@native/components/SpaceDrawer'
import { Drawer } from 'expo-router/drawer'

const ITEMS: DrawerItemType[] = [
  { name: 'index', label: 'Campus Feed', icon: 'house.fill' },
  { name: 'discover', label: 'Discover', icon: 'paperplane.fill' },
  { name: 'mine', label: 'My Societies', icon: 'person.2.fill' },
  { name: 'create', label: 'Create', icon: 'plus.circle.fill' }
]

export default function SocietiesLayout() {
  return (
    <SpaceDrawer items={ITEMS} spaceId="societies">
      <Drawer.Screen
        name="[organizationId]"
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false
        }}
      />
    </SpaceDrawer>
  )
}
