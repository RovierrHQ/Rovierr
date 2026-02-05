import { type Href, router } from 'expo-router'
import React, { useRef } from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ActionSheetThemed from './ActionSheetThemed'
import Avatar from './Avatar'
import Icon, { type IconName } from './Icon'
import ThemedText from './ThemedText'
import ThemedScroller from './ThemeScroller'

export default function CustomDrawerContent() {
  const insets = useSafeAreaInsets()
  const switchAccountRef = useRef<ActionSheetRef>(null)
  return (
    <>
      <ThemedScroller
        className="flex-1 !px-10 bg-background "
        style={{ paddingTop: insets.top }}
      >
        {/* User Profile Section */}
        <View className=" mb-8 py-10 border-b border-border   rounded-xl">
          <View className="flex-row items-center justify-between">
            <Avatar size="md" src={require('@rov/assets/img/thomino.jpg')} />
            <View className="flex-row items-center">
              <Avatar bgColor="bg-slate-500" name="Thomino" size="xxs" />
              <Icon
                className="ml-2"
                name="CircleEllipsis"
                onPress={() => switchAccountRef.current?.show()}
                size={27}
              />
            </View>
          </View>
          <View className="mt-4">
            <View className="flex-row items-center">
              <ThemedText className="font-semibold text-xl">Thomino</ThemedText>
              <Icon
                className="ml-2"
                color="lime"
                name="Verified"
                size={16}
                strokeWidth={2}
              />
            </View>
            <ThemedText className="text-base opacity-50">
              ThominoDesign
            </ThemedText>
          </View>
        </View>

        <View className="flex-col pb-6 mb-6 border-b border-border">
          <NavItem
            href="/(drawer)/(tabs)/profile"
            icon="User"
            label="Profile"
          />
          <NavItem href="/screens/subscription" icon="Trophy" label="Premium" />
          <NavItem href="/screens/chat/list" icon="Mail" label="Inbox" />
          <NavItem
            href="/(drawer)/(tabs)/search"
            icon="Search"
            label="Discover"
          />
          <NavItem
            href="/(drawer)/(tabs)/notifications"
            icon="Bell"
            label="Notifications"
          />
          <NavItem href="/screens/settings" icon="Settings" label="Settings" />
          <NavItem
            href="/screens/analytics"
            icon="ChartBar"
            label="Analytics"
          />
          <NavItem href="/screens/login" icon="LogOut" label="Logout" />
        </View>

        <View className="flex-row justify-between items-center">
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
            Version 1.0.0
          </ThemedText>
        </View>
      </ThemedScroller>
      <SwitchAccountDrawer ref={switchAccountRef} />
    </>
  )
}

type NavItemProps = {
  href: Href
  icon: IconName
  label: string
  className?: string
  description?: string
}

export const NavItem = ({ href, icon, label, description }: NavItemProps) => (
  <TouchableOpacity
    className={'flex-row items-center py-4'}
    onPress={() => router.push(href)}
  >
    <Icon className="" name={icon} size={24} strokeWidth={1.8} />

    <View className="flex-1 ml-6 ">
      {label && (
        <ThemedText className="text-2xl font-semibold ">{label}</ThemedText>
      )}
      {description && (
        <ThemedText className="opacity-50 text-xs">{description}</ThemedText>
      )}
    </View>
  </TouchableOpacity>
)

const SwitchAccountDrawer = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="switch-account-drawer" ref={ref}>
      <View className="p-global">
        <ProfileItem
          isSelected
          label="Personal account"
          name="Thomino"
          src={require('@rov/assets/img/thomino.jpg')}
        />
        <ProfileItem label="Business account" name="TZ Studios" />
        <Pressable className="items-center justify-center pt-6 mt-6 border-t border-border">
          <ThemedText className="text-lg font-semibold">Add Account</ThemedText>
        </Pressable>
      </View>
    </ActionSheetThemed>
  )
})

const ProfileItem = (props: any) => {
  return (
    <Pressable className="flex-row items-center  bg-secondary rounded-2xl py-4">
      <View className="flex-1">
        <ThemedText className="font-semibold text-xl">{props.name}</ThemedText>
        <ThemedText className="text-sm">{props.label}</ThemedText>
      </View>
      <View className="relative mr-4 flex-row items-center">
        {props.isSelected && (
          <Icon
            className=" w-7 mr-2 h-7 bg-highlight rounded-full border-2 border-secondary"
            color="white"
            name="Check"
            size={14}
            strokeWidth={2}
          />
        )}
        <Avatar
          bgColor="bg-slate-500"
          className="border border-border"
          name={props.name}
          size="sm"
          src={props.src}
        />
      </View>
    </Pressable>
  )
}
