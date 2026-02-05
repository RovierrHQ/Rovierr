import { Button } from '@rov/components/Button'
import Input from '@rov/components/forms/Input'
import Switch from '@rov/components/forms/Switch'
import Header from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import ThemedScroller from '@rov/components/ThemeScroller'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'

export default function EditProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  return (
    <>
      <Header
        rightComponents={[<Button key="save-changes" title="Save changes" />]}
        showBackButton
        title="Profile Settings"
      />
      <ThemedScroller>
        <View className="items-center flex-col mb-8 my-14  rounded-2xl">
          <TouchableOpacity
            activeOpacity={0.9}
            className="relative"
            onPress={pickImage}
          >
            {profileImage ? (
              <Image
                className="w-28 h-28 rounded-full"
                source={{ uri: profileImage }}
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-secondary items-center justify-center">
                <Icon
                  className="text-light-subtext dark:text-dark-subtext"
                  name="Plus"
                  size={25}
                />
              </View>
            )}
          </TouchableOpacity>
          <View className="mt-4">
            <Button
              className="text-sm text-light-subtext dark:text-dark-subtext"
              onPress={pickImage}
              title={profileImage ? 'Change photo' : 'Upload photo'}
              variant="outline"
            />

            {profileImage && (
              <Button
                className="mt-2"
                onPress={() => setProfileImage(null)}
                title="Remove photo"
                variant="outline"
              />
            )}
          </View>
        </View>
        <View className="px-global pt-10 pb-4 bg-secondary rounded-2xl border border-border">
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            label="Nickname"
            value="Thomino"
            variant="underlined"
            //containerClassName='mt-8'
          />
          <Input
            autoCapitalize="none"
            containerClassName="flex-1"
            keyboardType="email-address"
            label="Name"
            value="ThominoDesign"
            variant="underlined"
          />

          <Input
            autoCapitalize="none"
            containerClassName="mb-0"
            keyboardType="email-address"
            label="Email"
            value="thomino@example.com"
            variant="underlined"
          />

          <Switch
            className="border-b border-border py-4"
            description="Show your email to other users"
            label="Show email"
            onChange={() => {}}
            value={true}
          />
          <Switch
            className=" py-4"
            description="Hide your profile from search engines"
            label="Private account"
            onChange={() => {}}
            value={true}
          />
        </View>
      </ThemedScroller>
    </>
  )
}
