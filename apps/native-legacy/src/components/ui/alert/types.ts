import type { IconProps } from '@native/components/ui/icon/types'
import type * as React from 'react'
import type { AlertButton, AlertType, KeyboardType, View } from 'react-native'

type AlertInputValue = { login: string; password: string } | string

type AlertMethods = View & {
  show: () => void
  prompt: (args: AlertProps & { prompt: AlertProps['prompt'] }) => void
  alert: (args: AlertProps) => void
}

type AlertProps = {
  ref?: React.Ref<AlertMethods>
  title: string
  buttons: (Omit<AlertButton, 'onPress'> & {
    onPress?: (text: AlertInputValue) => void
  })[]
  message?: string | undefined
  prompt?: {
    type?: Exclude<AlertType, 'default'> | undefined
    defaultValue?: string | undefined
    keyboardType?: KeyboardType | undefined
  }
  materialPortalHost?: string
  materialIcon?: IconProps['materialCommunityIcon']
  materialWidth?: number
  children?: React.ReactNode
}

export type { AlertInputValue, AlertProps, AlertMethods }
