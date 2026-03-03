import { AntDesign } from '@expo/vector-icons'
import { useThemeColors } from '@rov/app/contexts/ThemeColors'
import ThemedText from '@rov/components/ThemedText'
import { Link } from 'expo-router'
import { Image, type ImageSourcePropType, Pressable, View } from 'react-native'

type TransactionItemProps = {
  title: string
  amount: string
  method: string
  time: string
  isIncome?: boolean
  icon?: keyof typeof AntDesign.glyphMap
  avatar?: string | ImageSourcePropType
}

export const TransactionItem = ({
  title,
  amount,
  method,
  time,
  isIncome,
  icon,
  avatar
}: TransactionItemProps) => {
  const colors = useThemeColors()
  return (
    <Link asChild href="/screens/transaction">
      <Pressable className="flex-row items-center justify-start py-3">
        <View className="w-14 h-14 bg-secondary rounded-full items-center justify-center mr-3">
          {icon && <AntDesign color={colors.text} name={icon} size={24} />}
          {avatar && (
            <Image
              className="w-full h-full rounded-full object-cover"
              source={typeof avatar === 'string' ? { uri: avatar } : avatar}
            />
          )}
        </View>
        <View>
          <ThemedText className="text-text text-lg font-bold">
            {title}
          </ThemedText>
          <ThemedText className="text-text text-sm opacity-55">
            {time}
          </ThemedText>
        </View>
        <View className="ml-auto items-end">
          <ThemedText
            className={`text-text text-lg font-semibold ${isIncome ? 'text-green-500' : 'text-text'}`}
          >
            {amount}
          </ThemedText>
          <ThemedText className="text-text text-sm opacity-55">
            {method}
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  )
}
