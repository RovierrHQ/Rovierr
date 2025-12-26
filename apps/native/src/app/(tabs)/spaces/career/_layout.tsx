import SpaceDrawer, {
  type DrawerItemType
} from '@native/components/SpaceDrawer'

const ITEMS: DrawerItemType[] = [
  { name: 'index', label: 'Applications', icon: 'doc.text.fill' },
  { name: 'internships', label: 'Internships', icon: 'briefcase.fill' },
  { name: 'resume-builder', label: 'Resume Builder', icon: 'person.fill' },
  { name: 'tuition', label: 'Tuition', icon: 'building.columns.fill' }
]

export default function CareerLayout() {
  return <SpaceDrawer items={ITEMS} spaceId="career" />
}
