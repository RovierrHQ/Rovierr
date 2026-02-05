import Switch from '@rov/components/forms/Switch'
import Header from '@rov/components/Header'
import Section from '@rov/components/layout/Section'
import ThemedScroller from '@rov/components/ThemeScroller'
import { useState } from 'react'

export default function NotificationSettingsScreen() {
  const [transactionAlerts, setTransactionAlerts] = useState(true)
  const [paymentReceived, setPaymentReceived] = useState(true)
  const [lowBalance, setLowBalance] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [monthlyStatement, setMonthlyStatement] = useState(false)
  const [promotions, setPromotions] = useState(false)

  return (
    <>
      <Header showBackButton />
      <ThemedScroller className="p-global">
        <Section
          className="mt-4 mb-10"
          title="Notification Settings"
          titleSize="4xl"
        />

        <Switch
          className="my-4"
          description="Get notified when someone likes your posts"
          icon="Heart"
          label="Likes & reactions"
          onChange={setTransactionAlerts}
          value={transactionAlerts}
        />
        <Switch
          className="my-4"
          description="Notifications when someone comments on your posts"
          icon="MessageCircle"
          label="Comments"
          onChange={setPaymentReceived}
          value={paymentReceived}
        />
        <Switch
          className="my-4"
          description="Get notified when someone follows you"
          icon="UserPlus"
          label="New followers"
          onChange={setLowBalance}
          value={lowBalance}
        />
        <Switch
          className="my-4"
          description="When someone mentions or tags you"
          icon="AtSign"
          label="Mentions & tags"
          onChange={setSecurityAlerts}
          value={securityAlerts}
        />
        <Switch
          className="my-4"
          description="New message notifications"
          icon="Mail"
          label="Direct messages"
          onChange={setMonthlyStatement}
          value={monthlyStatement}
        />
        <Switch
          className="my-4"
          description="When people you follow go live"
          icon="Video"
          label="Live notifications"
          onChange={setPromotions}
          value={promotions}
        />
      </ThemedScroller>
    </>
  )
}
