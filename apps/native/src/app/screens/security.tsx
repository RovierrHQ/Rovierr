import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import { Button } from '@rov/components/Button'
import Expandable from '@rov/components/Expandable'
import Input from '@rov/components/forms/Input'
import Switch from '@rov/components/forms/Switch'
import Header from '@rov/components/Header'
import ListLink from '@rov/components/ListLink'
import Section from '@rov/components/layout/Section'
import ThemedText from '@rov/components/ThemedText'
import ThemedScroller from '@rov/components/ThemeScroller'
import React, { useRef, useState } from 'react'
import { View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'

export default function CardControlsScreen() {
  const [verification, setVerification] = useState(true)
  const [locationTracking, setLocationTracking] = useState(true)
  const logoutDrawerRef = useRef<ActionSheetRef>(null)
  return (
    <>
      <Header showBackButton />
      <ThemedScroller>
        <Section
          className="mt-4 mb-10"
          title="Security and privacy"
          titleSize="4xl"
        />
        <Section className="mt-10 mb-4" title="Security" titleSize="2xl">
          <Expandable
            description="Enable a passcode to secure your account"
            icon="KeyRound"
            title="Passcode"
          >
            <Input placeholder="Password" secureTextEntry />
            <Input placeholder="Repeat password" secureTextEntry />
          </Expandable>
          <Expandable
            description="Status: On"
            icon="Fingerprint"
            title="2-step verification"
          >
            <Switch
              className="mb-6"
              description="Second layer of security"
              label="Enable"
              onChange={setVerification}
              value={verification}
            />
          </Expandable>
          <ListLink
            description="Logout of your account"
            icon="LogOut"
            onPress={() => {
              logoutDrawerRef.current?.show()
            }}
            title="Logout"
          />
        </Section>

        <Section className="mt-10 mb-4" title="Privacy" titleSize="2xl">
          <Switch
            className="border-b border-border pb-6 mt-3"
            description="Find friends from your contacts"
            icon="Users"
            label="Sync your contacts"
            onChange={setVerification}
            value={verification}
          />
          <Switch
            className="border-b border-border pb-6 mt-3"
            description="Share your location in posts"
            icon="Globe"
            label="Location sharing"
            onChange={setLocationTracking}
            value={locationTracking}
          />
          <Switch
            className="border-b border-border pb-6 mt-3"
            description="Only followers can see your posts"
            icon="Eye"
            label="Private account"
            onChange={setVerification}
            value={verification}
          />
          <Switch
            className="mb-6 pb-6 mt-3"
            description="Let others know when you've read their messages"
            icon="MessageCircle"
            label="Read receipts"
            onChange={setLocationTracking}
            value={locationTracking}
          />
        </Section>
      </ThemedScroller>
      <LogoutDrawer ref={logoutDrawerRef} />
    </>
  )
}

const LogoutDrawer = React.forwardRef<ActionSheetRef>((_props, ref) => {
  return (
    <ActionSheetThemed gestureEnabled id="logout-confirmation" ref={ref}>
      <View className="p-global pt-10 items-center">
        <ThemedText className="text-3xl font-bold">Logout?</ThemedText>
        <ThemedText className="text-base text-center mb-4">
          Are you sure you want to logout of your account?
        </ThemedText>
        <View className="flex-row items-center justify-center gap-2 mt-14">
          <Button
            className="flex-1"
            rounded="full"
            title="Cancel"
            variant="outline"
          />
          <Button className="flex-1" rounded="full" title="Logout" />
        </View>
      </View>
    </ActionSheetThemed>
  )
})
