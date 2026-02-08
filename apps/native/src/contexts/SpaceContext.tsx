import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import ProfileSelectItem from '@rov/components/ProfileSelectItem'
import ThemedText from '@rov/components/ThemedText'
import { type Href, router, usePathname } from 'expo-router'
import type React from 'react'
import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'

export type SpaceId = 'societies' | 'academics' | 'personal' | 'career'
type Society = { id: string; name: string }

type SpaceContextType = {
  space: SpaceId
  setSpace: (space: SpaceId) => void
  societies: Society[]
  activeSociety: Society | null
  setActiveSociety: (society: Society | null) => void
  openSocietySwitcher: () => void
  openSpaceSwitcher: () => void
}

const SpaceContext = createContext<SpaceContextType>({
  space: 'societies',
  setSpace: () => {},
  societies: [],
  activeSociety: null,
  setActiveSociety: () => {},
  openSocietySwitcher: () => {},
  openSpaceSwitcher: () => {}
})

const getSpaceFromPath = (path: string): SpaceId => {
  if (path.startsWith('/academics')) return 'academics'
  if (path.startsWith('/personal')) return 'personal'
  if (path.startsWith('/career')) return 'career'
  return 'societies'
}

const spaceRoutes: Record<SpaceId, Href> = {
  societies: '/societies',
  academics: '/academics',
  personal: '/personal',
  career: '/career'
}

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const space = useMemo(() => getSpaceFromPath(pathname), [pathname])
  const societySheetRef = useRef<ActionSheetRef>(null)
  const spaceSheetRef = useRef<ActionSheetRef>(null)
  const societies = useMemo<Society[]>(
    () => [
      { id: 'design', name: 'Design Society' },
      { id: 'startup', name: 'Startup Lagos' },
      { id: 'rovers', name: 'Rovers FC' }
    ],
    []
  )
  const [activeSociety, setActiveSociety] = useState<Society | null>(
    societies[0] || null
  )

  const setSpace = (nextSpace: SpaceId) => {
    router.replace(spaceRoutes[nextSpace])
  }

  const openSocietySwitcher = () => societySheetRef.current?.show()
  const openSpaceSwitcher = () => spaceSheetRef.current?.show()

  return (
    <SpaceContext.Provider
      value={{
        space,
        setSpace,
        societies,
        activeSociety,
        setActiveSociety,
        openSocietySwitcher,
        openSpaceSwitcher
      }}
    >
      {children}
      <ActionSheetThemed
        gestureEnabled
        id="society-switcher-sheet"
        ref={societySheetRef}
      >
        <View className="p-global">
          <ThemedText className="text-lg font-semibold mb-4">
            Switch society
          </ThemedText>
          <View className="gap-3">
            {societies.map((society) => (
              <ProfileSelectItem
                isSelected={activeSociety?.id === society.id}
                key={society.id}
                label="Society"
                name={society.name}
                onPress={() => {
                  setActiveSociety(society)
                  societySheetRef.current?.hide()
                }}
              />
            ))}
          </View>
          {societies.length === 0 && (
            <ThemedText className="text-text/60 text-sm">
              You are not in any societies yet.
            </ThemedText>
          )}
        </View>
      </ActionSheetThemed>
      <ActionSheetThemed
        gestureEnabled
        id="space-switcher-sheet"
        ref={spaceSheetRef}
      >
        <View className="p-global">
          <ThemedText className="text-lg font-semibold mb-4">
            Switch space
          </ThemedText>
          <View className="gap-3">
            {Object.entries(spaceRoutes).map(([id]) => (
              <ProfileSelectItem
                isSelected={space === id}
                key={id}
                label="Space"
                name={id.charAt(0).toUpperCase() + id.slice(1)}
                onPress={() => {
                  setSpace(id as SpaceId)
                  spaceSheetRef.current?.hide()
                }}
              />
            ))}
          </View>
        </View>
      </ActionSheetThemed>
    </SpaceContext.Provider>
  )
}

export const useSpace = () => useContext(SpaceContext)
