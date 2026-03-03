import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import AnimatedView from '@rov/components/AnimatedView'
import Avatar from '@rov/components/Avatar'
import { Button } from '@rov/components/Button'
import Header, { HeaderIcon } from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import { MasonryGrid } from '@rov/components/Masonry'
import { Placeholder } from '@rov/components/Placeholder'
import SocialPost from '@rov/components/SocialPost'
import ThemedText from '@rov/components/ThemedText'
import ThemeTabs, { ThemeTab } from '@rov/components/ThemeTabs'
import React, { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'

export default function UserProfileScreen() {
  const userActionsSheetRef = useRef<ActionSheetRef>(null)

  return (
    <>
      <Header
        rightComponents={[
          <HeaderIcon icon="Instagram" key="instagram" onPress={() => {}} />,
          <HeaderIcon
            icon="MoreHorizontal"
            key="more-horizontal"
            onPress={() => userActionsSheetRef.current?.show()}
          />
        ]}
        showBackButton
      />
      <AnimatedView
        animation="scaleIn"
        className="flex-1 bg-background"
        duration={300}
      >
        <ThemeTabs headerComponent={<ProfileHeader />}>
          <ThemeTab name="Posts">
            {mockPosts.map((post) => (
              <SocialPost key={post.id} {...post} />
            ))}
          </ThemeTab>
          <ThemeTab name="Media">
            <View className="p-2 bg-background">
              <MasonryGrid images={masonryImages} />
            </View>
          </ThemeTab>
          <ThemeTab name="Replies">
            <Placeholder
              className="mt-32"
              icon="Lightbulb"
              subtitle="You didn't reply to any post"
              title="Replies"
            />
          </ThemeTab>
        </ThemeTabs>
      </AnimatedView>
      <UserActionsSheet ref={userActionsSheetRef} />
    </>
  )
}

const ProfileHeader = () => {
  const [following, setFollowing] = useState(false)

  const toggleFollow = () => {
    setFollowing(!following)
  }
  return (
    <View className="p-global">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <ThemedText className="text-3xl font-bold">Bella Hughes</ThemedText>
          <ThemedText className="text-base">bella.hughes</ThemedText>
          <ThemedText className="text-base pr-20 mt-4">
            Addicted to tacos, cerveza and what's left of my sanity.
          </ThemedText>
        </View>
        <Avatar size="lg" src={require('@rov/assets/img/user-2.jpg')} />
      </View>
      <View className="flex-row items-center mt-4">
        <Avatar
          className=" border-2 border-background"
          size="xxs"
          src={require('@rov/assets/img/user-3.jpg')}
        />
        <Avatar
          className="-ml-2 border-2 border-background"
          size="xxs"
          src={require('@rov/assets/img/user-1.jpg')}
        />
        <ThemedText className="text-sm opacity-50 ml-2">
          184 followers
        </ThemedText>
        <View className="w-1 h-1 rounded-full bg-text opacity-20 mx-2" />
        <ThemedText className="text-sm opacity-50">
          native-templates.com
        </ThemedText>
      </View>
      <View className="flex-row items-center mt-6 gap-2">
        <Button
          className="flex-1"
          onPress={toggleFollow}
          size="small"
          title={following ? 'Following' : 'Follow'}
          variant={following ? 'outline' : 'primary'}
        />
        <Button
          className="flex-1"
          onPress={() => {}}
          size="small"
          title="Mention"
          variant="outline"
        />
      </View>
    </View>
  )
}

const UserActionsSheet = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="user-profile-actions" ref={ref}>
      <View className="p-global">
        <View className="rounded-2xl bg-background mb-4">
          <SheetItem icon="GalleryVertical" name="Add to feed" />
        </View>
        <View className="rounded-2xl bg-background mb-4">
          <SheetItem icon="QrCode" name="QR code" />
          <SheetItem icon="Link2" name="Copy link" />
          <SheetItem icon="Share2" name="Share to" />
        </View>
        <View className="rounded-2xl bg-background mb-4">
          <SheetItem icon="Volume" name="Mute" />
          <SheetItem icon="UserLock" name="Restrict" />
        </View>
        <View className="rounded-2xl bg-background">
          <SheetItem icon="UserX" name="Block" />
          <SheetItem icon="ShieldAlert" name="Report" />
        </View>
      </View>
    </ActionSheetThemed>
  )
})

const SheetItem = (props: any) => {
  return (
    <Pressable className="flex-row justify-between items-center  rounded-2xl p-4 border-b border-border">
      <ThemedText className="font-semibold text-base">{props.name}</ThemedText>
      <Icon name={props.icon} size={20} />
    </Pressable>
  )
}

const mockPosts = [
  {
    id: 3,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Bella Hughes',
    time: '2h ago',
    content:
      "Behind the scenes from today's photoshoot 📸 The perfect blend of elegance and edge",
    images: [
      'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ]
  },
  {
    id: 7,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Bella Hughes',
    time: '2h ago',
    content:
      "Behind the scenes from today's photoshoot 📸 The perfect blend of elegance and edge",
    images: [
      'https://images.unsplash.com/photo-1635776063043-ab23b4c226f6?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ]
  },
  {
    id: 1,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Bella Hughes',
    time: '6h ago',
    content:
      'New collection drop! ✨ Obsessed with these textures and colors. Fashion is all about expressing your inner creativity 💫',
    images: [
      'https://images.unsplash.com/photo-1635776062360-af423602aff3?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ]
  },

  {
    id: 2,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Bella Hughes',
    time: '4h ago',
    content:
      'Working on some new fashion concepts today. Really excited about sustainable fashion! What do you think about eco-friendly materials in high fashion? 🌱'
  },

  {
    id: 4,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Bella Hughes',
    time: '8h ago',
    content:
      'Sometimes the best outfit inspirations come from unexpected places. Just had a breakthrough moment while vintage shopping! 🛍️'
  },
  {
    id: 5,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Bella Hughes',
    time: '12h ago',
    content:
      'Golden hour fashion shoot was absolutely magical today! ✨ The way light plays with fabric is pure poetry',
    images: [
      'https://images.unsplash.com/photo-1635776062360-af423602aff3?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ]
  },
  {
    id: 6,
    src: require('@rov/assets/img/user-2.jpg'),
    name: 'Bella Hughes',
    time: '1d ago',
    content:
      'Grateful for all the support from this amazing fashion community! You all inspire me every day to keep creating and pushing style boundaries. Thank you! 👗💕'
  }
]

const masonryImages = [
  {
    id: 1,
    uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion portrait
  },
  {
    id: 2,
    uri: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    height: 240 // double height - fashion model
  },
  {
    id: 3,
    uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion accessories
  },
  {
    id: 4,
    uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion shoes
  },
  {
    id: 5,
    uri: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion outfit
  },
  {
    id: 6,
    uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    height: 240 // double height - fashion editorial
  },
  {
    id: 7,
    uri: 'https://images.unsplash.com/photo-1564584217132-2271339881b3?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion jewelry
  },
  {
    id: 8,
    uri: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion handbag
  },
  {
    id: 9,
    uri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop',
    height: 240 // double height - fashion model portrait
  },
  {
    id: 10,
    uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion clothing
  },
  {
    id: 11,
    uri: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion sunglasses
  },
  {
    id: 12,
    uri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion dress
  },
  {
    id: 14,
    uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion makeup
  },
  {
    id: 15,
    uri: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion boots
  },
  {
    id: 16,
    uri: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion portrait
  },
  {
    id: 17,
    uri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
    height: 240 // double height - fashion model
  },
  {
    id: 18,
    uri: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion watch
  },
  {
    id: 19,
    uri: 'https://images.unsplash.com/photo-1506629905850-b3ba3f8f8c65?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion coat
  },
  {
    id: 20,
    uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion scarf
  },
  {
    id: 21,
    uri: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    height: 240 // double height - fashion editorial
  },
  {
    id: 22,
    uri: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion sneakers
  },
  {
    id: 23,
    uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion jacket
  },
  {
    id: 24,
    uri: 'https://images.unsplash.com/photo-1472417583565-62e7bdeda490?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion hat
  },
  {
    id: 25,
    uri: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop',
    height: 240 // double height - fashion model
  },
  {
    id: 26,
    uri: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion jeans
  },
  {
    id: 27,
    uri: 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion blouse
  },
  {
    id: 28,
    uri: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion earrings
  },
  {
    id: 29,
    uri: 'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?q=80&w=800&auto=format&fit=crop',
    height: 240 // double height - fashion runway
  },
  {
    id: 30,
    uri: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800&auto=format&fit=crop',
    height: 120 // square - fashion bag
  }
]
