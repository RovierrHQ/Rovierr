import { Button } from '@native/components/ui/button'
import { Text } from '@native/components/ui/text'
import api from '@native/lib/api-client'
import { useStripe } from '@stripe/stripe-react-native'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native'

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const router = useRouter()
  const params = useLocalSearchParams<{
    productId: string
    amount: string
    currency: string
    productName: string
  }>()

  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const amount = Number.parseInt(params.amount || '0', 10)
  const currency = params.currency || 'hkd'

  const openPaymentSheet = async () => {
    try {
      const { error } = await presentPaymentSheet()

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message)
      } else {
        // Payment succeeded
        router.replace({
          pathname: '/(tabs)/(profile)/payment-success',
          params: {
            productName: params.productName || 'Product',
            amount: params.amount || '0',
            currency: params.currency || 'hkd'
          }
        })
      }
    } catch (error) {
      console.error('Error presenting payment sheet:', error)
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to present payment sheet'
      )
    }
  }

  useEffect(() => {
    const fetchPaymentSheetParams = async () => {
      const response = await api.stripe['payment-sheet'].post({
        amount,
        currency
      })

      if (response.error) {
        throw new Error(
          response.error.value?.message ||
            'Failed to fetch payment sheet params'
        )
      }

      if (response.data === undefined) {
        throw new Error('No data returned from API')
      }

      return response.data
    }

    const initializePaymentSheet = async () => {
      try {
        setInitializing(true)

        const { paymentIntent, customerEphemeralKeySecret, customer } =
          await fetchPaymentSheetParams()

        if (!paymentIntent) {
          throw new Error('Payment intent client secret is missing')
        }

        if (!customerEphemeralKeySecret) {
          throw new Error('Customer ephemeral key secret is missing')
        }

        const { error } = await initPaymentSheet({
          merchantDisplayName: 'Rovierr',
          customerId: customer,
          customerEphemeralKeySecret,
          paymentIntentClientSecret: paymentIntent,
          allowsDelayedPaymentMethods: true,
          returnURL: `${
            Constants.appOwnership === 'expo'
              ? Linking.createURL('/--/')
              : Linking.createURL('')
          }://stripe-redirect` as string,
          defaultBillingDetails: {
            // You can prefill with user data if available
          }
        })

        if (error) {
          Alert.alert('Error', error.message)
          setInitializing(false)
          return
        }

        setInitializing(false)
        setLoading(true)
      } catch (error) {
        console.error('Error initializing payment sheet:', error)
        Alert.alert(
          'Error',
          error instanceof Error
            ? error.message
            : 'Failed to initialize payment'
        )
        setInitializing(false)
      }
    }
    initializePaymentSheet()
  }, [amount, currency, initPaymentSheet])

  const formatPrice = (amount: number, currency = 'hkd'): string => {
    const locale = currency.toLowerCase() === 'hkd' ? 'en-HK' : 'en-US'
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase()
    })
    return formatter.format(amount / 100)
  }

  if (initializing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Checkout' }} />
        <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
          <ActivityIndicator color="#7c3aed" size="large" />
          <Text className="mt-4 text-zinc-600 dark:text-zinc-400">
            Preparing payment...
          </Text>
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Checkout' }} />
      <ScrollView className="flex-1 bg-zinc-50 dark:bg-black">
        <View className="p-4">
          <View className="bg-white dark:bg-zinc-900 rounded-2xl p-6 mb-4">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              {params.productName || 'Product'}
            </Text>
            <Text className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {formatPrice(amount, currency)}
            </Text>
          </View>

          <Button
            disabled={!loading}
            onPress={openPaymentSheet}
            size="lg"
            variant="primary"
          >
            <Text className="text-white font-semibold">Pay Now</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  )
}
