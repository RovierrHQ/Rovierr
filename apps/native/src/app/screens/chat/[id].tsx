import { useThemeColors } from '@rov/app/contexts/ThemeColors'
import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import Avatar from '@rov/components/Avatar'
import Header, { HeaderIcon } from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import PageLoader from '@rov/components/PageLoader'
import ThemedText from '@rov/components/ThemedText'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Message = {
  id: string
  text: string
  timestamp: string
  isSent: boolean
}

// Mock conversation data
const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hey there! How are you?',
    timestamp: '9:30 AM',
    isSent: false
  },
  {
    id: '2',
    text: "Hi! I'm doing great, thanks for asking. How about you?",
    timestamp: '9:31 AM',
    isSent: true
  },
  {
    id: '3',
    text: "I'm good too! Just wanted to discuss the project updates.",
    timestamp: '9:32 AM',
    isSent: false
  },
  {
    id: '4',
    text: "Sure! I've been working on the new features we discussed last week. Made some good progress!",
    timestamp: '9:33 AM',
    isSent: true
  },
  {
    id: '5',
    text: "That's great to hear! Could you share some details about what you've completed so far?",
    timestamp: '9:34 AM',
    isSent: false
  },
  {
    id: '6',
    text: "Of course! I've implemented the user authentication system and started working on the dashboard layout. I'll send you the documentation later today.",
    timestamp: '9:35 AM',
    isSent: true
  },
  {
    id: '7',
    text: 'Perfect! Looking forward to reviewing it. Let me know if you need any help or clarification.',
    timestamp: '9:36 AM',
    isSent: false
  }
]

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  avatar: 'https://i.pravatar.cc/150?img=1'
}

export default function ChatDetailScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)
  const actionSheetRef = useRef<ActionSheetRef>(null)
  const inputRef = useRef<TextInput>(null)
  const flatListRef = useRef<FlatList>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [_keyboardHeight, setKeyboardHeight] = useState(0)
  const colors = useThemeColors()
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true })
    }
  }, [messages.length])

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Scroll to bottom after loading
      setTimeout(scrollToBottom, 100)
    }, 1000)

    // Set up keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height)
        // Scroll to bottom when keyboard shows
        setTimeout(scrollToBottom, 100)
      }
    )

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
        // Scroll to bottom when keyboard hides
        setTimeout(scrollToBottom, 100)
      }
    )

    return () => {
      clearTimeout(timer)
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [scrollToBottom])

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  if (isLoading) {
    return <PageLoader text="Loading chat..." />
  }

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isSent: true
      }
      setMessages([...messages, newMessage])
      setMessage('')
    }
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`flex-row ${item.isSent ? 'justify-end' : 'justify-start'} mb-4 px-4`}
    >
      <View
        className={`rounded-2xl px-4 py-2 max-w-[80%] ${item.isSent ? 'bg-secondary' : 'border border-border'}`}
      >
        <ThemedText className={item.isSent ? 'text-text' : ''}>
          {item.text}
        </ThemedText>
        <ThemedText
          className={`text-xs mt-1 opacity-50 ${item.isSent ? '' : ''}`}
        >
          {item.timestamp}
        </ThemedText>
      </View>
    </View>
  )

  const rightComponents = [
    <HeaderIcon
      href={'/user-profile'}
      icon="MoreVertical"
      key="more-vertical"
      onPress={() => actionSheetRef.current?.show()}
    />
  ]

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View
        //style={{ paddingBottom: insets.bottom }}
        className="flex-1 bg-background"
      >
        <Header
          className="border-b border-border"
          leftComponent={
            <View className="mr-2">
              <Avatar
                className="mr-1"
                link={'/user-profile'}
                name={mockUser.name}
                size="sm"
                src={mockUser.avatar}
              />
            </View>
          }
          rightComponents={rightComponents}
          showBackButton
        />

        <FlatList
          contentContainerStyle={{
            paddingTop: 20,
            justifyContent: 'flex-end'
          }}
          //style={{ paddingBottom: insets.bottom + 200 }}
          data={messages}
          keyExtractor={(item) => item.id}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ref={flatListRef}
          renderItem={renderMessage}
        />

        <View
          className="p-2 pb-0  z-50  w-full  border-t border-border bg-background"
          style={{
            paddingBottom: insets.bottom
            //bottom: Platform.OS === 'ios' ? keyboardHeight : 0
            //position: Platform.OS === 'ios' ? 'absolute' : 'relative'
          }}
        >
          <View className="flex-row items-end bg-background rounded-xl px-4 py-2">
            <TextInput
              className="flex-1 max-h-32"
              multiline
              onChangeText={setMessage}
              onFocus={() => {
                // Add a space when the input is focused
                if (!message) {
                  setMessage(' ')
                }
                // Ensure we scroll to bottom when keyboard appears
                setTimeout(scrollToBottom, 0)
              }}
              placeholder="Type a message..."
              placeholderTextColor={colors.placeholder}
              ref={inputRef}
              style={{
                minHeight: 30,
                fontSize: 16,
                lineHeight: Platform.OS === 'android' ? 30 : 0,
                paddingTop: Platform.OS === 'android' ? 0 : 5,
                paddingBottom: Platform.OS === 'android' ? 0 : 0
              }}
              value={message}
            />
            <TouchableOpacity
              className="ml-2 mb-1"
              disabled={!message.trim()}
              onPress={handleSend}
            >
              <Icon
                className={message.trim() ? 'text-highlight' : 'opacity-50'}
                name="Send"
                size={24}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ActionSheetThemed
          containerStyle={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20
          }}
          gestureEnabled
          id={`chat-actions-${id}`}
          ref={actionSheetRef}
        >
          <View className="p-4">
            <View className=" bg-background rounded-xl">
              <TouchableOpacity className="p-4 flex-row items-center justify-between border-b border-border">
                <ThemedText className="text-lg">View Profile</ThemedText>
                <Icon className="mr-3" name="User" size={20} />
              </TouchableOpacity>
              <TouchableOpacity className="p-4 flex-row items-center justify-between">
                <ThemedText className="text-lg">Block User</ThemedText>
                <Icon className="mr-3" name="ShieldMinus" size={20} />
              </TouchableOpacity>
            </View>
            <View className=" bg-background rounded-xl mt-4">
              <TouchableOpacity className="p-4 flex-row items-center justify-between">
                <ThemedText className="text-lg">Report User</ThemedText>
                <Icon className="mr-3" name="Flag" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </ActionSheetThemed>
      </View>
    </KeyboardAvoidingView>
  )
}
