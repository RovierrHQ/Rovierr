import api from '@native/lib/api-client'
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import { useEffect, useState } from 'react'

export function StripeProvider({ children }: { children: React.ReactElement }) {
  const [publishableKey, setPublishableKey] = useState('')

  useEffect(() => {
    const fetchPublishableKey = async () => {
      const response = await api.stripe.publishableKey.get()
      if (response.error) {
        throw response.error
      }
      if (response.data !== undefined) {
        setPublishableKey(response.data.publishableKey)
      }
    }
    fetchPublishableKey()
  }, [])

  return (
    <StripeProviderNative
      merchantIdentifier=""
      publishableKey={publishableKey}
      urlScheme={
        Constants.appOwnership === 'expo'
          ? Linking.createURL('/--/')
          : Linking.createURL('')
      }
    >
      {children}
    </StripeProviderNative>
  )
}
