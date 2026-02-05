import { LinearGradient } from 'expo-linear-gradient'
import { Dimensions, Text, View } from 'react-native'

export const CardPreview = (props: {
  cardNumber?: string
  cardHolder?: string
  expiryDate?: string
  brand?: string
  onSetDefault: () => void
  onDelete: () => void
}) => {
  const { width } = Dimensions.get('window')
  return (
    <View
      className={` rounded-3xl flex flex-col justify-end ${props.brand === 'Visa' ? 'bg-lime-300' : 'bg-sky-300'}`}
      style={{ height: width * 0.4, width: width * 0.7 }}
    >
      <LinearGradient
        colors={[
          props.brand === 'Visa' ? '#BBF451' : '#74D4FF',
          props.brand === 'Mastercard' ? '#9DE1FF' : '#C0FF97'
        ]}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
        style={{ height: '100%', borderRadius: 15, justifyContent: 'flex-end' }}
      >
        <View className="p-4">
          <View className="flex-row justify-between">
            {props.cardNumber && (
              <Text className="font-bold font-mono text-base">
                •••• {props.cardNumber}
              </Text>
            )}
            <Text className="text-base font-mono font-bold">
              {props.expiryDate}
            </Text>
          </View>
        </View>

        <View className="absolute top-0 left-0 p-4 flex-row w-full justify-between">
          <Text className="text-base font-bold">{props.brand}</Text>
        </View>
      </LinearGradient>
    </View>
  )
}
