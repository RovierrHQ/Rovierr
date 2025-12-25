import SpaceDrawer, { type DrawerItemType } from '@/components/SpaceDrawer'

const ITEMS: DrawerItemType[] = [
  { name: 'index', label: 'Dashboard', icon: 'square.grid.2x2.fill' },
  { name: 'journal', label: 'Journal', icon: 'book.fill' },
  { name: 'todo', label: 'Todo', icon: 'doc.text.fill' },
  { name: 'settings', label: 'Settings', icon: 'gearshape.fill' }
]

// Note: Ensure 'gearshape.fill' is mapped or choose another
export default function PersonalLayout() {
  return <SpaceDrawer items={ITEMS} spaceId="personal" />
}
