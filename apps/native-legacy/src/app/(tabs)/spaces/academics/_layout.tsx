import { Redirect } from 'expo-router'

// const ITEMS: DrawerItemType[] = [
//   { name: 'index', label: 'Dashboard', icon: 'square.grid.2x2.fill' },
//   { name: 'courses', label: 'Courses', icon: 'book.fill' },
//   { name: 'discover', label: 'Discover', icon: 'paperplane.fill' },
//   { name: 'study-groups', label: 'Study Groups', icon: 'person.2.fill' },
//   { name: 'onboarding', label: 'Onboarding', icon: 'doc.text.fill' }
// ]

export default function AcademicsLayout() {
  return <Redirect href="/spaces/societies" />
}
