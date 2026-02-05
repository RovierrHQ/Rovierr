import { ScrollView, View } from 'react-native'
import Avatar from './Avatar'
import { Chip } from './Chip'
import ThemedText from './ThemedText'

export default function ChipExamples() {
  return (
    <ScrollView className="flex-1 p-4">
      <ThemedText className="text-xl font-bold mb-4">Chip Sizes</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip label="Extra Small" size="xs" />
        <Chip label="Small" size="sm" />
        <Chip label="Medium" size="md" />
        <Chip label="Large" size="lg" />
        <Chip label="Extra Large" size="xl" />
        <Chip label="2XL" size="xxl" />
      </View>

      <ThemedText className="text-xl font-bold mb-4">Selected State</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip label="Not Selected" />
        <Chip isSelected label="Selected" />
      </View>

      <ThemedText className="text-xl font-bold mb-4">With Icons</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip icon="Home" label="Home" />
        <Chip icon="Settings" isSelected label="Settings" />
        <Chip icon="Search" label="Search" size="lg" />
        <Chip icon="Bell" isSelected label="Notifications" size="xl" />
      </View>

      <ThemedText className="text-xl font-bold mb-4">With Images</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip
          image={{
            uri: 'https://mighty.tools/mockmind-api/content/human/108.jpg'
          }}
          label="John Doe"
        />
        <Chip
          image={{
            uri: 'https://mighty.tools/mockmind-api/content/human/107.jpg'
          }}
          isSelected
          label="Jane Smith"
        />
        <Chip
          image={{
            uri: 'https://mighty.tools/mockmind-api/content/human/106.jpg'
          }}
          label="Mike Johnson"
          size="lg"
        />
      </View>

      <ThemedText className="text-xl font-bold mb-4">As Links</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip href="/" icon="Home" label="Go to Home" />
        <Chip href="/profile" icon="User" isSelected label="Profile" />
        <Chip href="/settings" icon="Settings" label="Settings" size="lg" />
      </View>

      <ThemedText className="text-xl font-bold mb-4">
        With Custom Left Content
      </ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip
          label="Custom Avatar"
          leftContent={
            <Avatar
              className="mr-2"
              size="xs"
              src="https://mighty.tools/mockmind-api/content/human/105.jpg"
            />
          }
          size="lg"
        />
        <Chip
          isSelected
          label="Custom Badge"
          leftContent={
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
          }
        />
      </View>
    </ScrollView>
  )
}
