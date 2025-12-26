import { IconSymbol } from '@native/components/ui/icon-symbol'
import { DrawerActions } from '@react-navigation/native'
import { useLocalSearchParams } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { TouchableOpacity } from 'react-native'

export default function SocietyLayout() {
  const { organizationId } = useLocalSearchParams()

  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        headerShown: true,
        drawerPosition: 'right',
        headerTitle: `Society ${organizationId}`,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              // Toggle the parent (Societies) drawer
              navigation.getParent()?.dispatch(DrawerActions.toggleDrawer())
            }}
            style={{ marginLeft: 16 }}
          >
            <IconSymbol color="#007AFF" name="line.3.horizontal" size={24} />
          </TouchableOpacity>
        )
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Overview',
          title: 'Overview'
        }}
      />
      <Drawer.Screen
        name="tasks"
        options={{
          drawerLabel: 'Tasks',
          title: 'Tasks'
        }}
      />
      <Drawer.Screen
        name="members"
        options={{
          drawerLabel: 'Members',
          title: 'Members'
        }}
      />
      <Drawer.Screen
        name="expenses"
        options={{
          drawerLabel: 'Expenses',
          title: 'Expenses'
        }}
      />
    </Drawer>
  )
}
