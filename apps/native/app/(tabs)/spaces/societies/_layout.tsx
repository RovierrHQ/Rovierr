import SpaceDrawer, { type DrawerItemType } from '@/components/SpaceDrawer'

const ITEMS: DrawerItemType[] = [
  { name: 'index', label: 'Campus Feed', icon: 'house.fill' },
  { name: 'discover', label: 'Discover', icon: 'paperplane.fill' },
  { name: 'mine', label: 'My Societies', icon: 'person.2.fill' },
  { name: 'create', label: 'Create', icon: 'plus.circle.fill' }
]

export default function SocietiesLayout() {
  return <SpaceDrawer items={ITEMS} spaceId="societies" />
}
