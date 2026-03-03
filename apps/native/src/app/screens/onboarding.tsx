import Avatar from '@rov/components/Avatar'
import { Button } from '@rov/components/Button'
import { Chip } from '@rov/components/Chip'
import Input from '@rov/components/forms/Input'
import Selectable from '@rov/components/forms/Selectable'
import Icon from '@rov/components/Icon'
import MultiStep, { Step } from '@rov/components/MultiStep'
import ThemedText from '@rov/components/ThemedText'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native'

export default function OnboardingStart() {
  return (
    <View className="flex-1 bg-secondary">
      <MultiStep
        onClose={() => router.push('/(drawer)/(tabs)')}
        onComplete={() => {
          router.push('/(drawer)/(tabs)')
        }}
      >
        <Step title="Profile Picture">
          <ProfilePicture />
        </Step>

        <Step title="Username">
          <Username />
        </Step>

        <Step title="Interests">
          <Interests />
        </Step>

        <Step title="Categories">
          <Categories />
        </Step>

        <Step title="Follow People">
          <FollowPeople />
        </Step>
      </MultiStep>
    </View>
  )
}

const Username = () => {
  const [username, setUsername] = useState<string>('')

  return (
    <View className="flex-1 px-global justify-center pb-24">
      <Icon
        className="w-28  h-28  mb-6 rounded-full bg-secondary mx-auto"
        name="Camera"
        size={30}
      />
      <ThemedText className="text-center text-3xl font-bold ">
        Choose your username
      </ThemedText>
      <ThemedText className="text-center text-base opacity-60 mb-8">
        This is how others will find you
      </ThemedText>
      <Input
        autoCapitalize="none"
        onChangeText={setUsername}
        placeholder="@username"
        value={username}
      />
    </View>
  )
}

const Interests = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const interests = [
    'Photography',
    'Travel',
    'Food',
    'Fashion',
    'Technology',
    'Art',
    'Music',
    'Sports',
    'Fitness',
    'Design',
    'Nature',
    'Architecture',
    'Books',
    'Movies',
    'Gaming',
    'Science',
    'Business',
    'Lifestyle'
  ]

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  return (
    <View className="flex-1 px-global justify-center pb-24">
      <Icon
        className="w-28  h-28  mb-6 rounded-full bg-secondary mx-auto"
        name="Tag"
        size={30}
      />
      <ThemedText className="text-center text-3xl font-bold ">
        What are you interested in?
      </ThemedText>
      <ThemedText className="text-center text-base opacity-60 mb-8">
        Choose at least 3 topics to personalize your feed
      </ThemedText>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-3 justify-center">
          {interests.map((interest) => (
            <Chip
              isSelected={selectedInterests.includes(interest)}
              key={interest}
              label={interest}
              onPress={() => toggleInterest(interest)}
              size="lg"
            />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const Categories = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const categories = [
    { name: 'Creators', icon: 'Users' },
    { name: 'Brands', icon: 'Building2' },
    { name: 'News', icon: 'Newspaper' },
    { name: 'Entertainment', icon: 'Tv' },
    { name: 'Education', icon: 'GraduationCap' },
    { name: 'Local', icon: 'MapPin' }
  ]

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  return (
    <ScrollView className="flex-1 px-global">
      <Icon
        className="w-28  h-28  mb-6 rounded-full bg-secondary mx-auto"
        name="Star"
        size={30}
      />
      <ThemedText className="text-center text-3xl font-bold ">
        What type of content?
      </ThemedText>
      <ThemedText className="text-center text-base opacity-60 mb-8">
        Select the types of accounts you want to see
      </ThemedText>

      <View className="space-y-3">
        {categories.map((category) => (
          <Selectable
            icon={category.icon as any}
            key={category.name}
            onPress={() => toggleCategory(category.name)}
            selected={selectedCategories.includes(category.name)}
            title={category.name}
          />
        ))}
      </View>
    </ScrollView>
  )
}

const FollowPeople = () => {
  const [followedUsers, setFollowedUsers] = useState<string[]>([])

  const suggestedUsers = [
    {
      id: '1',
      name: 'Alex Johnson',
      username: '@alexj',
      avatar: require('@rov/assets/img/user-1.jpg'),
      followers: '12.5K'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      username: '@maria_g',
      avatar: require('@rov/assets/img/user-2.jpg'),
      followers: '8.2K'
    },
    {
      id: '3',
      name: 'David Chen',
      username: '@dchen',
      avatar: require('@rov/assets/img/user-3.jpg'),
      followers: '15.1K'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      username: '@swilson',
      avatar: require('@rov/assets/img/user-4.jpg'),
      followers: '9.8K'
    },
    {
      id: '5',
      name: 'Mike Rodriguez',
      username: '@mike_r',
      avatar: require('@rov/assets/img/thomino.jpg'),
      followers: '11.3K'
    }
  ]

  const toggleFollow = (userId: string) => {
    setFollowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <View className="flex-1 px-global">
      <Icon
        className="w-28  h-28  mb-6 rounded-full bg-secondary mx-auto"
        name="Users"
        size={30}
      />
      <ThemedText className="text-center text-3xl font-bold">
        Follow interesting people
      </ThemedText>
      <ThemedText className="text-center text-base opacity-60 mb-8">
        Start building your network
      </ThemedText>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-4">
          {suggestedUsers.map((user) => (
            <View
              className="flex-row items-center justify-between bg-background rounded-xl p-4"
              key={user.id}
            >
              <View className="flex-row items-center flex-1">
                <Avatar className="mr-3" size="md" src={user.avatar} />
                <View className="flex-1">
                  <ThemedText className="font-bold text-base">
                    {user.name}
                  </ThemedText>
                  <ThemedText className="text-sm opacity-60">
                    {user.username}
                  </ThemedText>
                  <ThemedText className="text-xs opacity-40">
                    {user.followers} followers
                  </ThemedText>
                </View>
              </View>
              <Button
                className={followedUsers.includes(user.id) ? '' : '!bg-text'}
                onPress={() => toggleFollow(user.id)}
                size="small"
                textClassName={
                  followedUsers.includes(user.id) ? '' : '!text-invert'
                }
                title={followedUsers.includes(user.id) ? 'Following' : 'Follow'}
                variant={
                  followedUsers.includes(user.id) ? 'outline' : 'primary'
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const ProfilePicture = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Sorry, we need camera roll permissions to make this work!'
      )
      return false
    }
    return true
  }

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Sorry, we need camera permissions to take photos!'
      )
      return false
    }
    return true
  }

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermission()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  return (
    <View className="flex-1 px-global items-center justify-center">
      {selectedImage ? (
        <Image
          className="w-26 h-26 mx-auto rounded-2xl border border-border"
          source={{ uri: selectedImage }}
        />
      ) : (
        <Icon
          className="w-28  h-28  mb-6 rounded-full bg-secondary mx-auto"
          name="Camera"
          size={30}
        />
      )}
      <ThemedText className="text-center text-3xl font-bold">
        Add a profile picture
      </ThemedText>
      <ThemedText className="text-center text-base opacity-60 mb-8">
        Help others recognize you
      </ThemedText>

      <View className="items-center pb-24">
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="bg-secondary rounded-xl px-6 py-3"
            onPress={takePhoto}
          >
            <View className="flex-row items-center gap-2">
              <ThemedText className="font-medium">Take Photo</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-secondary rounded-xl px-6 py-3"
            onPress={pickImageFromGallery}
          >
            <View className="flex-row items-center gap-2">
              <ThemedText className="font-medium">Choose Photo</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
