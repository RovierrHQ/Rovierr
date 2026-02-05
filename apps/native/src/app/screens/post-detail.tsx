import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import Avatar from '@rov/components/Avatar'
import Header, { HeaderIcon } from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import SocialPost from '@rov/components/SocialPost'
import ThemedText from '@rov/components/ThemedText'
import ThemedFooter from '@rov/components/ThemeFooter'
import ThemedScroller from '@rov/components/ThemeScroller'
import React, { useRef, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useThemeColors from '../contexts/ThemeColors'

export default function PostScreen() {
  const [following, setFollowing] = useState(false)
  const userActionsSheetRef = useRef<ActionSheetRef>(null)
  const toggleFollow = () => {
    setFollowing(!following)
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Header
          rightComponents={[
            <HeaderIcon
              icon="Ellipsis"
              key="ellipsis"
              onPress={() => userActionsSheetRef.current?.show()}
            />
          ]}
          showBackButton
          title="Post"
        />
        <ThemedScroller className="!pt-0 !px-0">
          <View className="px-global border-b border-border pb-4">
            <View className="flex-row items-center w-full">
              <Avatar size="md" src={require('@rov/assets/img/thomino.jpg')} />
              <View className=" ml-4">
                <ThemedText className="text-lg font-bold">Thomino</ThemedText>
                <ThemedText className="text-sm opacity-50">
                  ThominoDesign
                </ThemedText>
              </View>
              <Pressable
                className={`${following ? 'bg-transparent border-border' : 'bg-text border-transparent'} items-center border rounded-full px-8 py-2 ml-auto`}
                onPress={toggleFollow}
              >
                <Text
                  className={`${following ? 'text-text' : 'text-background'} text-xs font-semibold`}
                >
                  {following ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </View>
            <View className=" pt-6 pb-2">
              <ThemedText className="text-xl">
                This is a post about React Native and how it works with Expo
                router. Very cool stuff.
              </ThemedText>
              <ThemedText className="text-xl mt-4">
                Lorem ipsum dolor sit amet.
              </ThemedText>
              <View className="flex-row items-center mt-2 gap-2">
                <ThemedText className="text-lg opacity-50">17:20</ThemedText>
                <View className="w-1 h-1 bg-border rounded-full" />
                <ThemedText className="text-lg opacity-50">
                  25 Aug 26
                </ThemedText>
              </View>
            </View>
            <Actions />
            <Image
              className="w-full h-80 rounded-3xl object-cover"
              source={{
                uri: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }}
              style={{ objectFit: 'cover' }}
            />
          </View>

          {mockPosts.map((post) => (
            <SocialPost
              content={post.content}
              key={post.id}
              name={post.name}
              src={post.src}
              time={post.time}
            />
          ))}
        </ThemedScroller>
        <ThemedFooter
          className={`border-t border-border !px-2 !pt-2 ${Platform.OS === 'ios' ? '' : 'absolute bottom-0 left-0 right-0'}`}
        >
          <CommentInput />
        </ThemedFooter>
      </KeyboardAvoidingView>
      <UserActionsSheet ref={userActionsSheetRef} />
    </>
  )
}

const CommentInput = () => {
  const _insets = useSafeAreaInsets()
  const colors = useThemeColors()
  return (
    <View className="bg-secondary rounded-full px-2 py-2 flex-row items-center">
      <Avatar size="sm" src={require('@rov/assets/img/thomino.jpg')} />
      <TextInput
        className="flex-1 text-text rounded-xl px-4"
        placeholder="Post reply"
        placeholderTextColor={colors.placeholder}
      />
      <Icon className="opacity-40 mr-4" name="SendHorizonal" size={20} />
    </View>
  )
}

const UserActionsSheet = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="post-detail-actions" ref={ref}>
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

const Actions = () => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)

  const handleLikePress = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <View className="flex-row items-center py-4 mb-4 border-y border-border pr-global">
      <View className="flex-row items-center">
        <Icon
          color={isLiked ? '#ef4444' : undefined}
          fill={isLiked ? '#ef4444' : undefined}
          name="Heart"
          onPress={handleLikePress}
          size={24}
        />
        <ThemedText className="text-sm ml-1">{likeCount}</ThemedText>
      </View>
      <View className="flex-row items-center ml-6">
        <Icon name="MessageCircle" onPress={() => {}} size={24} />
        <ThemedText className="text-sm ml-1">12</ThemedText>
      </View>
      <View className="flex-row items-center ml-auto">
        <Icon name="SendHorizonal" onPress={() => {}} size={24} />
      </View>
    </View>
  )
}

const mockPosts = [
  {
    id: 1,
    src: require('@rov/assets/img/user-1.jpg'),
    name: 'Amy Smith',
    time: '2h ago',
    content:
      'Just finished an amazing hike in the mountains! The view was absolutely breathtaking'
  },
  {
    id: 2,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Jane Stone',
    time: '4h ago',
    content:
      'Working on some new designs today. Really excited about this project! What do you think about minimalist approaches in modern UI?'
  },
  {
    id: 3,
    src: require('@rov/assets/img/user-3.jpg'),
    name: 'Andy Doe',
    time: '6h ago',
    content: 'Coffee shop vibes ☕ Perfect place to get some work done!'
  },
  {
    id: 4,
    src: require('@rov/assets/img/thomino.jpg'),
    name: 'Thomino',
    time: '8h ago',
    content:
      'Sometimes the best ideas come when you least expect them. Just had a breakthrough moment while walking!'
  },
  {
    id: 5,
    src: require('@rov/assets/img/user-1.jpg'),
    name: 'Amy Smith',
    time: '12h ago',
    content: 'Sunset photography session was incredible today!'
  },
  {
    id: 6,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Jane Stone',
    time: '1d ago',
    content:
      'Grateful for all the support from this amazing community! You all inspire me every day to keep creating and pushing boundaries. Thank you!'
  }
]
