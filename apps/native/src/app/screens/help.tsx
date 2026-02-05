import AnimatedView from '@rov/components/AnimatedView'
import { Button } from '@rov/components/Button'
import Expandable from '@rov/components/Expandable'
import Header from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import Section from '@rov/components/layout/Section'
import ThemedText from '@rov/components/ThemedText'
import { Linking, ScrollView, TouchableOpacity, View } from 'react-native'

// FAQ data
const faqData = [
  {
    id: '1',
    question: 'How do I create a post?',
    answer:
      'Tap the "+" button on your home screen or use the compose button. Add your text, photos, or videos, tag friends if you want, and tap "Publish" to share your post with your followers.'
  },
  {
    id: '2',
    question: 'How do I make my account private?',
    answer:
      'Go to Settings > Security & Privacy > Privacy and toggle on "Private account". When your account is private, only your approved followers can see your posts and stories.'
  },
  {
    id: '3',
    question: 'How do I report inappropriate content?',
    answer:
      'Tap the three dots (⋯) on any post, comment, or profile and select "Report". Choose the reason for reporting and we\'ll review the content. You can also block users to prevent them from contacting you.'
  },
  {
    id: '4',
    question: 'How do I find and add friends?',
    answer:
      'Use the search feature to find people by username or name. You can also sync your contacts in Settings to find friends who are already on the platform. Tap "Follow" to connect with them.'
  },
  {
    id: '5',
    question: 'Is my personal information safe?',
    answer:
      'Yes! We use industry-standard encryption to protect your data. We never share your personal information with third parties without your consent. You control what information is visible on your profile.'
  },
  {
    id: '6',
    question: 'How do notifications work?',
    answer:
      "You'll get notifications for likes, comments, new followers, mentions, and messages. You can customize which notifications you receive in Settings > Notification Settings."
  },
  {
    id: '7',
    question: 'How do I verify my account?',
    answer:
      'Account verification is available for public figures, brands, and notable accounts. Submit a verification request through Settings > Account > Request Verification with supporting documentation.'
  },
  {
    id: '8',
    question: 'Can I delete or edit my posts?',
    answer:
      'Yes! Tap the three dots on your post and select "Edit" to modify the caption or "Delete" to remove it completely. Note that likes and comments will be lost if you delete a post.'
  }
]

// Contact information
const contactInfo = [
  {
    id: 'email',
    type: 'Email Support',
    value: 'support@feedy.com',
    icon: 'Mail' as const,
    action: () => Linking.openURL('mailto:support@feedy.com')
  },
  {
    id: 'phone',
    type: 'Phone Support',
    value: '+1 (800) 555-FEED',
    icon: 'Phone' as const,
    action: () => Linking.openURL('tel:+18005553333')
  },
  {
    id: 'hours',
    type: 'Support Hours',
    value: '24/7 Community Support',
    icon: 'Clock' as const,
    action: undefined
  }
]

export default function HelpScreen() {
  return (
    <View className="flex-1 bg-background dark:bg-dark-primary">
      <Header showBackButton title="Help & Support" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedView animation="fadeIn" duration={400}>
          {/* FAQ Section */}
          <Section
            className="px-global pt-6 pb-2"
            title="Frequently Asked Questions"
            titleSize="xl"
          />

          <View className="px-global">
            {faqData.map((faq) => (
              <Expandable className="py-1" key={faq.id} title={faq.question}>
                <ThemedText className="text-light-text dark:text-dark-text leading-6">
                  {faq.answer}
                </ThemedText>
              </Expandable>
            ))}
          </View>

          {/* Contact Section */}
          <Section
            className="px-global pb-2 mt-14"
            subtitle="We're here to help with any questions or concerns"
            title="Contact Us"
            titleSize="xl"
          />

          <View className="px-global pb-8">
            {contactInfo.map((contact) => (
              <TouchableOpacity
                className="flex-row items-center py-4 border-b border-border"
                disabled={!contact.action}
                key={contact.id}
                onPress={contact.action}
              >
                <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center mr-4">
                  <Icon name={contact.icon} size={20} />
                </View>
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    {contact.type}
                  </ThemedText>
                  <ThemedText className="font-medium">
                    {contact.value}
                  </ThemedText>
                </View>
                {contact.action && (
                  <Icon
                    className="ml-auto text-light-subtext dark:text-dark-subtext"
                    name="ChevronRight"
                    size={20}
                  />
                )}
              </TouchableOpacity>
            ))}

            <Button
              className="mt-8"
              iconStart="Mail"
              onPress={() => Linking.openURL('mailto:support@feedy.com')}
              title="Email Us"
            />
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  )
}
