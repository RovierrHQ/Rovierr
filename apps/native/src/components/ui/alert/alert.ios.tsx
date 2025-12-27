import { useAugmentedRef } from '@rn-primitives/hooks'
import * as Slot from '@rn-primitives/slot'
import type * as React from 'react'
import { type AlertButton, Pressable, Alert as RNAlert } from 'react-native'

import type { AlertMethods, AlertProps } from './types'

function Alert({ ref, children, title, buttons, message, prompt }: AlertProps) {
  const augmentedRef = useAugmentedRef<AlertMethods>({
    // biome-ignore lint/suspicious/noExplicitAny: ref type mismatch due to duplicated React types
    ref: ref as any,
    methods: {
      show: () => {
        onPress()
      },
      alert,
      prompt: promptAlert
    },
    deps: [prompt]
  })

  function promptAlert(
    args: AlertProps & { prompt: Required<AlertProps['prompt']> }
  ) {
    RNAlert.prompt(
      args.title,
      args.message,
      args.buttons as AlertButton[],
      args.prompt?.type,
      args.prompt?.defaultValue,
      args.prompt?.keyboardType
    )
  }

  function alert(args: AlertProps) {
    RNAlert.alert(args.title, args.message, args.buttons as AlertButton[])
  }

  function onPress() {
    if (prompt) {
      promptAlert({
        title,
        message,
        buttons,
        prompt: prompt as Required<AlertProps['prompt']>
      })
      return
    }
    alert({ title, message, buttons })
  }

  const Component = children ? Slot.Pressable : Pressable
  return (
    <Component onPress={onPress} ref={augmentedRef}>
      {children}
    </Component>
  )
}

Alert.displayName = 'Alert'

function AlertAnchor({ ref }: { ref: React.Ref<AlertMethods> }) {
  return <Alert buttons={[]} ref={ref} title="" />
}

export { Alert, AlertAnchor }
