import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import { Image, Pressable, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ActionSheetThemed from './ActionSheetThemed'
import Avatar from './Avatar'
import { CardScroller } from './CardScroller'
import Icon from './Icon'
import ThemedText from './ThemedText'

type SocialPostProps = {
  src?: any
  name?: string
  time?: string
  content?: string
  images?: string[]
}

export default function SocialPost(props: SocialPostProps) {
  const [_modalVisible, _setModalVisible] = useState(false)
  const userActionsSheetRef = useRef<ActionSheetRef>(null)
  const _insets = useSafeAreaInsets()
  return (
    <>
      <View className=" border-b border-border py-8">
        <View className="items-start flex-row w-full">
          <View className="pl-global pr-3 flex-shrink-0 ">
            <Avatar link="/screens/user-profile" size="sm" src={props.src} />
          </View>
          <View className="flex-1 pr-global">
            <View className="flex-row items-center justify-start">
              <Pressable onPress={() => router.push('/screens/user-profile')}>
                <ThemedText className="text-base font-bold">
                  {props.name}
                </ThemedText>
              </Pressable>
              <ThemedText className="text-xs opacity-40 ml-2">
                {props.time}
              </ThemedText>
              <Icon
                className="ml-auto opacity-60"
                name="MoreVertical"
                onPress={() => userActionsSheetRef.current?.show()}
                size={18}
              />
            </View>
            {props.content && (
              <Pressable onPress={() => router.push('/screens/post-detail')}>
                <ThemedText className="text-base mb-4">
                  {props.content}
                </ThemedText>
              </Pressable>
            )}
          </View>
        </View>
        {props.images && props.images.length > 1 && (
          <CardScroller className="">
            <View className="w-16" />
            {props.images.map((imageUri, index) => (
              <Pressable
                key={index}
                onPress={() => router.push('/screens/post-detail')}
              >
                <Image
                  className="h-60 rounded-xl"
                  resizeMode="cover" // Fixed aspect ratio
                  source={{ uri: imageUri }}
                  style={{ aspectRatio: 0.8 }}
                />
              </Pressable>
            ))}
            <View className="w-16" />
          </CardScroller>
        )}
        {props.images && props.images.length === 1 && (
          <Pressable
            className="flex-row pr-global"
            onPress={() => router.push('/screens/post-detail')}
          >
            <View className="w-20" />
            <Image
              className="flex-1 rounded-xl"
              resizeMode="cover"
              source={{ uri: props.images[0] }}
              style={{ aspectRatio: 1.2 }}
            />
          </Pressable>
        )}
        <Actions />
      </View>

      <UserActionsSheet ref={userActionsSheetRef} />
    </>
  )
}

const Actions = () => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)

  const handleLikePress = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <View className="flex-row items-center mt-4 pl-20 pr-global">
      <View className="flex-row items-center">
        <Icon
          color={isLiked ? '#ef4444' : undefined}
          fill={isLiked ? '#ef4444' : undefined}
          name="Heart"
          onPress={handleLikePress}
          size={18}
        />
        <ThemedText className="text-sm ml-1">{likeCount}</ThemedText>
      </View>
      <View className="flex-row items-center ml-6">
        <Icon name="MessageCircle" onPress={() => {}} size={18} />
        <ThemedText className="text-sm ml-1">12</ThemedText>
      </View>
      <View className="flex-row items-center ml-auto">
        <Icon name="SendHorizonal" onPress={() => {}} size={18} />
      </View>
    </View>
  )
}

const UserActionsSheet = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="social-post-actions" ref={ref}>
      <View className="p-global">
        <View className="rounded-2xl bg-background mb-4">
          <SheetItem icon="QrCode" name="QR code" />
          <SheetItem icon="Link2" name="Copy link" />
          <SheetItem icon="Share2" name="Share post" />
        </View>
        <View className="rounded-2xl bg-background mb-4">
          <SheetItem icon="Volume" name="Mute user" />
          <SheetItem icon="UserLock" name="Restrict" />
        </View>
        <View className="rounded-2xl bg-background">
          <SheetItem icon="UserX" name="Block user" />
          <SheetItem icon="ShieldAlert" name="Report post" />
        </View>
      </View>
    </ActionSheetThemed>
  )
})

const SheetItem = (props: any) => {
  return (
    <Pressable
      className="flex-row justify-between items-center  rounded-2xl p-4 border-b border-border"
      onPress={props.onPress}
    >
      <ThemedText className="font-semibold text-base">{props.name}</ThemedText>
      <Icon name={props.icon} size={20} />
    </Pressable>
  )
}
