import { useStripe } from '@stripe/stripe-react-native'
import * as Linking from 'expo-linking'
import { useCallback, useEffect } from 'react'

/**
 * Component to handle Stripe deep linking for payment redirects
 * Should be placed inside StripeProvider
 */
export function StripeDeepLinkHandler() {
  const { handleURLCallback } = useStripe()

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url)
        if (stripeHandled) {
          // This was a Stripe URL - handled by Stripe SDK
          return
        }
        // This was NOT a Stripe URL – handle as you normally would
        // You can add custom deep link handling here if needed
      }
    },
    [handleURLCallback]
  )

  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL()
      handleDeepLink(initialUrl)
    }

    getUrlAsync()

    // Listen for deep links while app is running
    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url)
      }
    )

    return () => {
      deepLinkListener.remove()
    }
  }, [handleDeepLink])

  return null
}
