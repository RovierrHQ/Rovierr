import { Button } from '@native/components/ui/button'
import { Icon } from '@native/components/ui/icon'
import { Text } from '@native/components/ui/text'
import { Stack, useRouter } from 'expo-router'
import { ScrollView, View } from 'react-native'

// Stripe product ID
const PRODUCT_ID = 'prod_TgIxTUU0Hrdq3a'
const LIFETIME_PRICE = 5800 // 58 HKD in cents
const REGULAR_PRICE = 5800 // 58 HKD per semester/year
const CURRENCY = 'hkd'

function formatPrice(amount: number, currency = 'hkd'): string {
  const formatter = new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: currency.toUpperCase()
  })
  return formatter.format(amount / 100)
}

export default function PricingScreen() {
  const router = useRouter()

  const handleSelectProduct = () => {
    router.push({
      pathname: '/(tabs)/(profile)/checkout',
      params: {
        productId: PRODUCT_ID,
        amount: LIFETIME_PRICE.toString(),
        currency: CURRENCY,
        productName: 'Founding Member - Lifetime Access'
      }
    })
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pricing' }} />
      <ScrollView className="flex-1 bg-zinc-50 dark:bg-black">
        <View className="p-4">
          {/* Early Bird Badge */}
          <View className="items-center mb-4">
            <View className="bg-violet-600 px-6 py-2 rounded-full">
              <Text className="text-white font-bold text-sm uppercase tracking-wide">
                🎉 Early Bird Special
              </Text>
            </View>
          </View>

          {/* Main Pricing Card */}
          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 border-violet-200 dark:border-violet-800 shadow-xl">
            {/* Badge */}
            <View className="absolute top-4 right-4 bg-violet-600 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">LIMITED TIME</Text>
            </View>

            <View className="items-center mb-6">
              <Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
                Founding Member
              </Text>
              <Text className="text-lg text-zinc-600 dark:text-zinc-400 text-center mb-4">
                Join us as an early adopter and get lifetime access
              </Text>

              {/* Price Comparison */}
              <View className="items-center mb-6">
                <View className="flex-row items-baseline mb-2">
                  <Text className="text-zinc-400 dark:text-zinc-500 line-through text-lg mr-2">
                    {formatPrice(REGULAR_PRICE, CURRENCY)}
                  </Text>
                  <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
                    per semester
                  </Text>
                </View>
                <Text className="text-5xl font-bold text-violet-600 dark:text-violet-400 mb-1">
                  {formatPrice(LIFETIME_PRICE, CURRENCY)}
                </Text>
                <Text className="text-violet-600 dark:text-violet-400 font-semibold text-lg">
                  One-time payment • Lifetime access
                </Text>
              </View>

              {/* Value Proposition */}
              <View className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-4 w-full mb-6">
                <Text className="text-center text-violet-900 dark:text-violet-200 font-semibold mb-2">
                  💰 Save thousands over time
                </Text>
                <Text className="text-center text-violet-700 dark:text-violet-300 text-sm">
                  Regular pricing: {formatPrice(REGULAR_PRICE, CURRENCY)} per
                  semester
                </Text>
                <Text className="text-center text-violet-700 dark:text-violet-300 text-sm mt-1">
                  You pay once, access forever
                </Text>
              </View>
            </View>

            {/* Features */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                What you get:
              </Text>
              {[
                'Lifetime access to all features',
                'No recurring fees ever',
                'Founding member badge',
                'Priority support',
                'Early access to new features',
                'Exclusive community access'
              ].map((feature, index) => (
                <View className="flex-row items-start mb-3" key={index}>
                  <View className="bg-violet-100 dark:bg-violet-900/30 rounded-full p-1 mr-3 mt-0.5">
                    <Icon color="#7c3aed" name="checkmark" size={16} />
                  </View>
                  <Text className="text-zinc-700 dark:text-zinc-300 flex-1 text-base">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* CTA Button */}
            <Button
              className="mt-4"
              onPress={handleSelectProduct}
              size="lg"
              variant="primary"
            >
              <Text className="text-white font-bold text-lg">
                Claim Your Lifetime Deal
              </Text>
            </Button>

            {/* Fine Print */}
            <Text className="text-center text-zinc-500 dark:text-zinc-400 text-xs mt-4">
              This offer is only available to early adopters.{'\n'}
              Regular pricing will be {formatPrice(REGULAR_PRICE, CURRENCY)} per
              semester after launch.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  )
}
