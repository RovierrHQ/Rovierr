import { Redirect } from 'expo-router'
import { useAtomValue } from 'jotai'
import { currentSpaceAtom } from '@/store/space'

export default function SpacesIndex() {
  const currentSpaceId = useAtomValue(currentSpaceAtom)
  return <Redirect href={`/(tabs)/spaces/${currentSpaceId}`} />
}
