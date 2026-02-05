import { Stack } from 'expo-router'

export default function SpacesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="academics" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="societies" />
      <Stack.Screen name="career" />
    </Stack>
  )
}
