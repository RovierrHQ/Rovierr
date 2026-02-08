import {
  Outfit_400Regular,
  Outfit_700Bold,
  useFonts
} from '@expo-google-fonts/outfit'
import CustomDrawerContent from '@rov/components/CustomDrawerContent'
import { Drawer } from 'expo-router/drawer'
import React from 'react'
import { DrawerProvider } from '../../contexts/DrawerContext'
import { useThemeColors } from '../../contexts/ThemeColors'
// Create a ref to the drawer instance that can be used across the app
export const drawerRef = React.createRef()

export default function DrawerLayout() {
  const colors = useThemeColors()
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_700Bold
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <DrawerProvider>
      <Drawer
        drawerContent={CustomDrawerContent}
        ref={drawerRef}
        screenOptions={{
          headerShown: false,
          drawerType: 'back',
          drawerPosition: 'left',
          drawerStyle: {
            backgroundColor: colors.secondary,
            width: '85%',
            flex: 1
          },
          overlayColor: 'rgba(0,0,0, 0.4)',
          swipeEdgeWidth: 100
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Caloria',
            drawerLabel: 'Home'
          }}
        />
      </Drawer>
    </DrawerProvider>
  )
}
