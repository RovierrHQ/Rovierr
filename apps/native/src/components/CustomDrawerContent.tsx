import AnimatedView from '@rov/components/AnimatedView'
import { type Href, router } from 'expo-router'
import { Pressable, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSpace } from '../contexts/SpaceContext'
import { authClient } from '../lib/auth-client'
import Avatar from './Avatar'
import Icon, { type IconName } from './Icon'
import ThemedText from './ThemedText'
import ThemedScroller from './ThemeScroller'

export default function CustomDrawerContent() {
  const insets = useSafeAreaInsets()
  const handleLogout = async () => {
    await authClient.signOut()
  }
  const {
    space,
    openSocietySwitcher,
    openSpaceSwitcher,
    activeSociety,
    societies
  } = useSpace()
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* User Profile Section */}
      <View className="px-10 pb-6 mb-2 border-b border-border">
        <Pressable onPress={() => router.push('/societies/profile')}>
          <View className="flex-row items-center justify-between">
            <Avatar size="md" src={require('@rov/assets/img/thomino.jpg')} />
            <View className="flex-row items-center">
              <Avatar bgColor="bg-slate-500" name="Thomino" size="xxs" />
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
        </Pressable>

        {space === 'societies' && (
          <View className="mt-6">
            <ThemedText className="text-sm opacity-60">
              Current society
            </ThemedText>
            {societies.length > 0 ? (
              <Pressable
                className="mt-3 rounded-2xl border border-border bg-card px-4 py-3"
                onPress={openSocietySwitcher}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <ThemedText className="text-base font-semibold">
                      {activeSociety?.name}
                    </ThemedText>
                    <ThemedText className="text-text/60 text-sm">
                      Tap to switch societies
                    </ThemedText>
                  </View>
                  <Icon name="ChevronDown" size={18} />
                </View>
              </Pressable>
            ) : (
              <View className="mt-3">
                <NavItem
                  href="/societies/search"
                  icon="Search"
                  label="Find a society"
                />
              </View>
            )}
          </View>
        )}
      </View>

      <ThemedScroller className="flex-1 !px-10">
        <AnimatedView
          animation="slideInRight"
          className="pb-6"
          duration={220}
          key={space}
        >
          {space === 'societies' && (
            <>
              <View className="flex-col pb-6 mb-6 border-b border-border">
                <NavItem
                  href="/societies/members"
                  icon="Users"
                  label="Members"
                />
                <NavItem
                  href="/societies/announcements"
                  icon="Megaphone"
                  label="Announcements"
                />
                <NavItem
                  href="/societies/settings"
                  icon="Settings"
                  label="Society settings"
                />
              </View>

              <View className="flex-col pb-6 mb-6 border-b border-border">
                <NavItem href="/societies/store" icon="Store" label="Store" />
                <NavItem
                  href="/societies/tuition"
                  icon="GraduationCap"
                  label="Tuition"
                />
                <NavItem
                  href="/societies/internships"
                  icon="Briefcase"
                  label="Internships"
                />
                <NavItem href="/societies/fun" icon="Gamepad2" label="Fun" />
              </View>
            </>
          )}

          {space === 'academics' && (
            <View className="flex-col pb-6 mb-6 border-b border-border">
              <NavItem href="/academics" icon="Home" label="Today" />
              <NavItem
                href="/academics/courses"
                icon="BookOpen"
                label="Courses"
              />
              <NavItem
                href="/academics/texts"
                icon="MessageCircle"
                label="Texts"
              />
            </View>
          )}

          {space === 'personal' && (
            <View className="flex-col pb-6 mb-6 border-b border-border">
              <NavItem href="/personal" icon="User" label="Personal home" />
            </View>
          )}

          {space === 'career' && (
            <View className="flex-col pb-6 mb-6 border-b border-border">
              <NavItem href="/career" icon="Briefcase" label="Career home" />
            </View>
          )}

          <View className="flex-col pb-6 mb-6 border-b border-border">
            <NavItem
              href="/screens/subscription"
              icon="Trophy"
              label="Premium"
            />
            <NavItem href="/screens/chat/list" icon="Mail" label="Inbox" />
            <NavItem
              href="/screens/settings"
              icon="Settings"
              label="Settings"
            />
            <NavItem
              href="/screens/analytics"
              icon="ChartBar"
              label="Analytics"
            />
            <NavItem
              href="/login"
              icon="LogOut"
              label="Logout"
              onPress={handleLogout}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
              Version 1.0.0
            </ThemedText>
          </View>
        </AnimatedView>
      </ThemedScroller>

      <View
        className="px-10 pt-2 border-t border-border"
        style={{ paddingBottom: insets.bottom || 12 }}
      >
        <ThemedText className="text-sm opacity-60 mb-2">
          Switch space
        </ThemedText>
        <Pressable
          className="flex-row items-center bg-secondary rounded-2xl py-3 px-4"
          onPress={openSpaceSwitcher}
        >
          <View className="flex-1">
            <ThemedText className="font-semibold text-xl">
              {space.charAt(0).toUpperCase() + space.slice(1)}
            </ThemedText>
            <ThemedText className="text-sm">Space</ThemedText>
          </View>
          <View className="relative flex-row items-center">
            <Icon name="ChevronDown" size={16} />
          </View>
        </Pressable>
      </View>
    </View>
  )
}

type NavItemProps = {
  href: Href
  icon: IconName
  label: string
  className?: string
  description?: string
  onPress?: () => void
}

export const NavItem = ({
  href,
  icon,
  label,
  description,
  onPress
}: NavItemProps) => (
  <TouchableOpacity
    className={'flex-row items-center py-4'}
    onPress={onPress ?? (() => router.push(href))}
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
