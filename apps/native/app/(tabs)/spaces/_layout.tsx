''
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList
} from '@react-navigation/drawer'
import { useTranslation } from '@rovierr/localization'
import { Drawer } from 'expo-router/drawer'
import { useAtomValue } from 'jotai'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { currentSpaceAtom } from '@/store/space'

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const currentSpaceId = useAtomValue(currentSpaceAtom)
  return (
    <DrawerContentScrollView {...props}>
      <ThemedView style={{ padding: 20 }}>
        <ThemedText type="subtitle">Current Space:</ThemedText>
        <ThemedText
          style={{ textTransform: 'capitalize' }}
          type="defaultSemiBold"
        >
          {currentSpaceId}
        </ThemedText>
      </ThemedView>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  )
}

export default function SpacesDrawerLayout() {
  const { t } = useTranslation()
  const currentSpaceId = useAtomValue(currentSpaceAtom)

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: t('common:home', 'Home'),
          title:
            currentSpaceId.charAt(0).toUpperCase() + currentSpaceId.slice(1)
        }}
      />
    </Drawer>
  )
}
