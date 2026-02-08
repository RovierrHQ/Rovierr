import Avatar from '@rov/components/Avatar'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import useThemeColors from '@rov/contexts/ThemeColors'
import { Link, router } from 'expo-router'
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ChatUser = {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

// Mock data for demonstration
const mockChats: ChatUser[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage:
      'Hey, how are you doing? Just checking in to see if you received the files I sent.',
    timestamp: '2m ago',
    unread: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'The meeting has been rescheduled to tomorrow at 2 PM.',
    timestamp: '1h ago',
    unread: true
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Thanks for your help!',
    timestamp: '2h ago',
    unread: false
  },
  {
    id: '4',
    name: 'Anthony Smith',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage:
      'Hey, how are you doing? Just checking in to see if you received the files I sent.',
    timestamp: '2m ago',
    unread: false
  },
  {
    id: '5',
    name: 'Jane Doe',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'The meeting has been rescheduled to tomorrow at 2 PM.',
    timestamp: '1h ago',
    unread: false
  },
  {
    id: '6',
    name: 'Mike Doe',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Thanks for your help!',
    timestamp: '2h ago',
    unread: false
  },
  {
    id: '7',
    name: 'Anthony Smith',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage:
      'Hey, how are you doing? Just checking in to see if you received the files I sent.',
    timestamp: '2m ago',
    unread: false
  },
  {
    id: '8',
    name: 'Jane Doe',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'The meeting has been rescheduled to tomorrow at 2 PM.',
    timestamp: '1h ago',
    unread: false
  },
  {
    id: '9',
    name: 'Mike Doe',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Thanks for your help!',
    timestamp: '2h ago',
    unread: false
  }
  // Add more mock data as needed
]

export default function ChatListScreen() {
  const renderChatItem = ({ item }: { item: ChatUser }) => (
    <Link asChild href={`/screens/chat/${item.id}`}>
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b border-border ${item.unread ? '' : ''}`}
      >
        <Avatar name={item.name} size="lg" src={item.avatar} />
        <View className="flex-1 ml-5">
          <View className="flex-row justify-start items-center">
            <ThemedText className="font-bold text-lg">{item.name}</ThemedText>
            <ThemedText className="text-sm opacity-50 ml-2">
              {item.timestamp}
            </ThemedText>
            {item.unread && (
              <View className="w-2 h-2 rounded-full bg-highlight ml-auto" />
            )}
          </View>
          <View className="flex-row items-center ">
            <ThemedText
              //numberOfLines={1}
              className={`flex-1 text-base opacity-50 pr-10 ${item.unread ? ' font-medium' : ''}`}
            >
              {item.lastMessage}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  )

  return (
    <View className="flex-1 bg-background">
      <SearchInput />

      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={mockChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const SearchInput = () => {
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()
  return (
    <View
      className="flex-row px-4 pb-4 items-center  justify-between"
      style={{ paddingTop: insets.top }}
    >
      <View className="bg-secondary rounded-full py-4 flex-row items-center">
        <Icon
          className="pl-2"
          name="ArrowLeft"
          onPress={() => router.back()}
          size={20}
        />
        <TextInput
          className="flex-1 text-text rounded-xl px-4 "
          placeholder="Search users"
          placeholderTextColor={colors.placeholder}
        />
        <Icon className="opacity-40 mr-4" name="X" size={20} />
      </View>
    </View>
  )
}
