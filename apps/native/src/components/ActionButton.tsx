import { Pressable, View } from 'react-native'
import Icon from './Icon'
import ThemedText from './ThemedText'

export const ActionButton = (props: {
  icon: any
  label?: string
  onPress?: () => void
}) => {
  return (
    <Pressable
      className="flex flex-col items-center justify-center min-w-[70px]"
      onPress={props.onPress}
    >
      <View className="w-16 h-16 bg-highlight rounded-full items-center justify-center">
        <Icon color="black" name={props.icon} size={24} />
      </View>
      {props.label && (
        <ThemedText className="text-center text-sm font-semibold mt-2">
          {props.label}
        </ThemedText>
      )}
    </Pressable>
  )
}
