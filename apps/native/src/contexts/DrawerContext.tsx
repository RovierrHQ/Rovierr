import { DrawerActions } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import type React from 'react'
import { createContext, useCallback, useContext } from 'react'

type DrawerContextType = {
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation()

  const openDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer())
  }, [navigation])

  const closeDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.closeDrawer())
  }, [navigation])

  const toggleDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.toggleDrawer())
  }, [navigation])

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const context = useContext(DrawerContext)

  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider')
  }

  return context
}

export default DrawerProvider
