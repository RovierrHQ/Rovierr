import { currentSpaceAtom } from '@native/store/space'
import { Redirect } from 'expo-router'
import { useAtomValue } from 'jotai'

export default function SpacesIndex() {
  const currentSpaceId = useAtomValue(currentSpaceAtom)
  return <Redirect href={`/(tabs)/spaces/${currentSpaceId}`} />
}
