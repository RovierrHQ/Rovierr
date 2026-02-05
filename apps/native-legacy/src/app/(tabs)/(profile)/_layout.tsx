import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Profile' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: 'Edit Profile'
        }}
      />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="pricing" options={{ title: 'Pricing' }} />
      <Stack.Screen
        name="checkout"
        options={{
          title: 'Checkout',
          presentation: 'formSheet'
        }}
      />
      <Stack.Screen
        name="payment-success"
        options={{
          title: 'Payment Success',
          presentation: 'formSheet'
        }}
      />
      <Stack.Screen
        name="share"
        options={{
          title: 'Share Profile',
          headerShown: false,
          presentation: 'formSheet'
        }}
      />
    </Stack>
  )
}
