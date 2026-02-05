import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import AnimatedView from '@rov/components/AnimatedView'
import Avatar from '@rov/components/Avatar'
import { Button } from '@rov/components/Button'
import { CardScroller } from '@rov/components/CardScroller'
import Header from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import ThemedFooter from '@rov/components/ThemeFooter'
import * as ImagePicker from 'expo-image-picker'
import React, { useRef, useState } from 'react'
import { Image, Pressable, Text, TextInput, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import useThemeColors from '../contexts/ThemeColors'

const galleryImages = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop'
]

export default function AddPostScreen() {
  const colors = useThemeColors()
  const whoCanSeeSheetRef = useRef<ActionSheetRef>(null)
  const tagPeopleSheetRef = useRef<ActionSheetRef>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    })

    if (!result.canceled) {
      setSelectedImages([...selectedImages, result.assets[0].uri])
    }
  }

  const selectGalleryImage = (uri: string) => {
    if (!selectedImages.includes(uri)) {
      setSelectedImages([...selectedImages, uri])
    }
  }

  const removeImage = (uri: string) => {
    setSelectedImages(selectedImages.filter((img) => img !== uri))
  }
  return (
    <>
      <Header
        rightComponents={[
          <Button
            className="-mr-2"
            key="draft"
            size="small"
            textClassName="!text-highlight"
            title="Draft"
            variant="ghost"
          />,
          <Button key="publish" size="small" title="Publish" />
        ]}
        showBackButton
        title="New Post"
      />

      <View className="flex-1 bg-background">
        <View>
          <View className="flex flex-row items-center justify-between px-global">
            <View className="flex flex-row items-start gap-2">
              <Avatar size="sm" src={require('@rov/assets/img/thomino.jpg')} />
              <View className="ml-2 flex-1 items-start justify-start">
                <Pressable
                  className="px-3 py-2 flex-row items-center mr-auto border border-highlight rounded-full"
                  onPress={() => whoCanSeeSheetRef.current?.show()}
                >
                  <Text className="text-highlight">Everyone</Text>
                  <Icon color={colors.highlight} name="ChevronDown" size={16} />
                </Pressable>
                <TextInput
                  className="text-2xl pt-4 w-full h-44 text-text "
                  multiline
                  numberOfLines={10}
                  placeholder="What's happening?"
                  placeholderTextColor={colors.placeholder}
                  style={{ height: 100 }}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </View>
        {selectedImages.length > 0 && (
          <CardScroller className="mb-2 px-2" space={4}>
            <View className="w-20 h-20" />
            {selectedImages.map((uri, index) => (
              <AnimatedView
                animation="scaleIn"
                className="w-44 h-44 relative"
                key={index}
              >
                <Pressable
                  className="absolute top-2 right-2 z-50 bg-background w-8 h-8 rounded-full items-center justify-center"
                  onPress={() => removeImage(uri)}
                >
                  <Icon name="Trash" size={15} />
                </Pressable>
                <Image className="w-full h-full rounded-lg" source={{ uri }} />
              </AnimatedView>
            ))}
          </CardScroller>
        )}
      </View>
      <ThemedFooter className="!px-0">
        <CardScroller className="mb-2 px-2" space={4}>
          <Pressable
            className="w-24 h-24 rounded-lg border border-border items-center justify-center"
            onPress={pickImage}
          >
            <Icon name="Plus" size={24} />
          </Pressable>
          {galleryImages.map((uri, index) => (
            <Pressable key={index} onPress={() => selectGalleryImage(uri)}>
              <Image className="w-24 h-24 rounded-lg" source={{ uri }} />
            </Pressable>
          ))}
          <View className="w-24 h-24 rounded-lg " />
        </CardScroller>
        <Pressable
          className="flex flex-row items-center border-y border-border px-global py-4"
          onPress={() => whoCanSeeSheetRef.current?.show()}
        >
          <Icon color={colors.highlight} name="Globe" size={18} />
          <Text className="text-highlight ml-2">Everyone can reply</Text>
        </Pressable>
        <View className="flex flex-row items-center gap-10 py-4 px-global">
          <Icon name="Image" onPress={pickImage} size={22} />
          <Icon
            name="Tag"
            onPress={() => tagPeopleSheetRef.current?.show()}
            size={22}
          />
          <Icon name="MapPin" size={22} />
          <Icon className="ml-auto" name="PlusCircle" size={22} />
        </View>
      </ThemedFooter>
      <WhoCanSeeSheet ref={whoCanSeeSheetRef} />
      <TagPeopleSheet ref={tagPeopleSheetRef} />
    </>
  )
}

const WhoCanSeeSheet = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="who-can-see-sheet" ref={ref}>
      <View className="p-global">
        <ThemedText className="text-2xl font-bold mb-4">
          Who can see this post?
        </ThemedText>
        <SheetItem
          icon="Globe"
          isSelected
          label="Everyone can see the post"
          name="Everyone"
        />
        <SheetItem
          icon="Lock"
          label="Only you can see the post"
          name="Private"
        />
        <SheetItem
          icon="UserCheck"
          label="Only your followers can see the post"
          name="My followers"
        />
      </View>
    </ActionSheetThemed>
  )
})

const SheetItem = (props: any) => {
  return (
    <Pressable className="flex-row items-center  bg-secondary rounded-2xl py-4">
      <View className="relative mr-4">
        <Icon name={props.icon} size={24} />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold text-xl">{props.name}</ThemedText>
        <ThemedText className="text-sm">{props.label}</ThemedText>
      </View>
      {props.isSelected && (
        <Icon
          className="w-7 h-7 bg-highlight rounded-full border-2 border-secondary"
          color="white"
          name="Check"
          size={14}
          strokeWidth={2}
        />
      )}
    </Pressable>
  )
}

const TagPeopleSheet = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="tag-people-sheet" ref={ref}>
      <View className="p-global">
        <ThemedText className="text-2xl font-bold mb-4">Tag people</ThemedText>
        <TagPerson
          name="Jennie"
          src={require('@rov/assets/img/user-1.jpg')}
          username="jen"
        />
        <TagPerson
          name="Abby"
          src={require('@rov/assets/img/user-2.jpg')}
          username="abbie"
        />
        <TagPerson
          name="Andy"
          src={require('@rov/assets/img/user-3.jpg')}
          username="Andy"
        />
      </View>
    </ActionSheetThemed>
  )
})

const TagPerson = (props: any) => {
  const [tagged, setTagged] = useState(false)

  const toggleTag = () => {
    setTagged(!tagged)
  }

  return (
    <Pressable className="flex-row items-center  bg-secondary rounded-2xl py-3">
      <View className="relative mr-4">
        <Avatar
          className="border border-border"
          name={props.name}
          size="md"
          src={props.src}
        />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold text-xl">{props.name}</ThemedText>
        <ThemedText className="text-sm">{props.username}</ThemedText>
      </View>
      <Pressable
        className={`items-center my-auto rounded-lg px-4 py-2 ml-auto ${tagged ? 'bg-transparent border border-border' : 'bg-text'}`}
        onPress={toggleTag}
      >
        <Text
          className={`${tagged ? 'text-text' : 'text-background'} text-sm font-semibold`}
        >
          {tagged ? 'Tagged' : 'Tag'}
        </Text>
      </Pressable>
    </Pressable>
  )
}
