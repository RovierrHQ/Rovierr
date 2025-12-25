import { Stack } from 'expo-router'

export default function SpacesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="academics" options={{ headerShown: false }} />
      <Stack.Screen name="personal" options={{ headerShown: false }} />
      <Stack.Screen name="societies" options={{ headerShown: false }} />
      <Stack.Screen name="career" options={{ headerShown: false }} />
    </Stack>
  )
}
