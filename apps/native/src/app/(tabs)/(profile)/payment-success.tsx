import { Button } from '@native/components/ui/button'
import { Icon } from '@native/components/ui/icon'
import { Text } from '@native/components/ui/text'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { View } from 'react-native'

export default function PaymentSuccessScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    productName: string
    amount: string
    currency: string
  }>()

  const formatPrice = (amount: number, currency = 'hkd'): string => {
    const locale = currency.toLowerCase() === 'hkd' ? 'en-HK' : 'en-US'
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase()
    })
    return formatter.format(amount / 100)
  }

  const amount = Number.parseInt(params.amount || '0', 10)
  const currency = params.currency || 'hkd'

  return (
    <>
      <Stack.Screen options={{ title: 'Payment Success' }} />
      <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-8 items-center max-w-md w-full">
          <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-6">
            <Icon color="#10b981" name="checkmark.circle.fill" size={48} />
          </View>

          <Text className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
            Payment Successful!
          </Text>

          <Text className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
            Your payment has been processed successfully.
          </Text>

          <View className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-zinc-600 dark:text-zinc-400">Product:</Text>
              <Text className="text-zinc-900 dark:text-white font-medium">
                {params.productName || 'Product'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-zinc-600 dark:text-zinc-400">Amount:</Text>
              <Text className="text-zinc-900 dark:text-white font-medium">
                {formatPrice(amount, currency)}
              </Text>
            </View>
          </View>

          <Button
            className="w-full"
            onPress={() => {
              router.back()
              router.back() // Go back to pricing screen
            }}
            size="lg"
            variant="primary"
          >
            <Text className="text-white font-semibold">Done</Text>
          </Button>
        </View>
      </View>
    </>
  )
}
