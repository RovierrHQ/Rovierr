import Header from '@rov/components/Header'
import ListLink from '@rov/components/ListLink'
import Section from '@rov/components/layout/Section'
import ThemedScroller from '@rov/components/ThemeScroller'
import ThemeToggle from '@rov/components/ThemeToggle'
import { View } from 'react-native'

export default function SettingsScreen() {
  return (
    <>
      <Header
        rightComponents={[<ThemeToggle key="theme-toggle" />]}
        showBackButton
      />
      <View className="flex-1">
        <ThemedScroller className="flex-1 pt-4">
          <Section className=" mt-6 mb-14" title="Settings" titleSize="4xl" />

          <ListLink
            description="Customize how you get updates"
            href="/screens/notification-settings"
            icon="Bell"
            showChevron
            title="Notifications"
          />
          <ListLink
            description="Manage your security settings"
            href="/screens/security"
            icon="Shield"
            showChevron
            title="Security"
          />
          <ListLink
            description="Get help with your account"
            href="/screens/help"
            icon="HelpCircle"
            showChevron
            title="Help"
          />
          <ListLink
            description="Manage your profile"
            href="/screens/edit-profile"
            icon="Settings"
            showChevron
            title="Profile"
          />

          <ListLink
            description="Change your language"
            href="/screens/languages"
            icon="Globe"
            showChevron
            title="Language"
          />
          <ListLink
            description="Logout of your account"
            href="/screens/welcome"
            icon="LogOut"
            title="Logout"
          />
        </ThemedScroller>
      </View>
    </>
  )
}
