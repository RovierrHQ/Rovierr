import { useColorScheme } from '@native/lib/use-color-scheme'
import { cn } from '@native/lib/utils'
import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog'
import { useAugmentedRef } from '@rn-primitives/hooks'
import * as React from 'react'
import { type TextInput, View } from 'react-native'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  useAnimatedStyle
} from 'react-native-reanimated'
import { Button } from '../button'
import { Icon } from '../icon'
import { Text } from '../text'
import { TextField } from '../text-field'
import type { AlertMethods, AlertProps } from './types'

function Alert({
  ref,
  children,
  title: titleProp,
  message: messageProp,
  buttons: buttonsProp,
  prompt: promptProp,
  materialIcon: materialIconProp,
  materialWidth: materialWidthProp,
  materialPortalHost
}: AlertProps) {
  const { height } = useReanimatedKeyboardAnimation()
  const [open, setOpen] = React.useState(false)
  const [
    { title, message, buttons, prompt, materialIcon, materialWidth },
    setProps
  ] = React.useState<AlertProps>({
    title: titleProp,
    message: messageProp,
    buttons: buttonsProp,
    prompt: promptProp,
    materialIcon: materialIconProp,
    materialWidth: materialWidthProp
  })
  const [text, setText] = React.useState(promptProp?.defaultValue ?? '')
  const [password, setPassword] = React.useState('')
  const { colors } = useColorScheme()
  const passwordRef = React.useRef<TextInput>(null)
  const augmentedRef = useAugmentedRef<AlertMethods>({
    // biome-ignore lint/suspicious/noExplicitAny: ref type mismatch due to duplicated React types
    ref: ref as any,
    methods: {
      show: () => {
        setOpen(true)
      },
      alert,
      prompt: promptAlert
    }
  })

  const bottomPaddingStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: height.value * -1
    }
  })

  function promptAlert(
    args: AlertProps & { prompt: Required<AlertProps['prompt']> }
  ) {
    setText(args.prompt?.defaultValue ?? '')
    setPassword('')
    setProps(args)
    setOpen(true)
  }

  function alert(args: AlertProps) {
    setText(args.prompt?.defaultValue ?? '')
    setPassword('')
    setProps(args)
    setOpen(true)
  }

  function onOpenChange(open: boolean) {
    if (!open) {
      setText(prompt?.defaultValue ?? '')
      setPassword('')
    }
    setOpen(open)
  }

  return (
    <AlertDialogPrimitive.Root
      onOpenChange={onOpenChange}
      open={open}
      ref={augmentedRef}
    >
      <AlertDialogPrimitive.Trigger asChild={!!children}>
        {children}
      </AlertDialogPrimitive.Trigger>
      <AlertDialogPrimitive.Portal hostName={materialPortalHost}>
        <AlertDialogPrimitive.Overlay asChild>
          <Animated.View
            className={cn(
              'bg-popover/80 absolute bottom-0 left-0 right-0 top-0 items-center justify-center px-3'
            )}
            entering={FadeIn}
            exiting={FadeOut}
            style={bottomPaddingStyle}
          >
            <AlertDialogPrimitive.Content>
              <Animated.View
                className="min-w-72 max-w-xl rounded-3xl bg-card p-6 pt-7 shadow-xl"
                entering={FadeInDown}
                exiting={FadeOutDown}
                style={
                  typeof materialWidth === 'number'
                    ? { width: materialWidth }
                    : undefined
                }
              >
                {!!materialIcon && (
                  <View className="items-center pb-4">
                    <Icon
                      color={colors.foreground}
                      materialCommunityIcon={materialIcon}
                      name="questionmark"
                      size={27}
                    />
                  </View>
                )}
                {message ? (
                  <>
                    <AlertDialogPrimitive.Title asChild>
                      <Text
                        className={cn(!!materialIcon && 'text-center', 'pb-4')}
                        variant="title2"
                      >
                        {title}
                      </Text>
                    </AlertDialogPrimitive.Title>
                    <AlertDialogPrimitive.Description asChild>
                      <Text className="pb-4 opacity-90" variant="subhead">
                        {message}
                      </Text>
                    </AlertDialogPrimitive.Description>
                  </>
                ) : materialIcon ? (
                  <AlertDialogPrimitive.Title asChild>
                    <Text
                      className={cn(!!materialIcon && 'text-center', 'pb-4')}
                      variant="title2"
                    >
                      {title}
                    </Text>
                  </AlertDialogPrimitive.Title>
                ) : (
                  <AlertDialogPrimitive.Title asChild>
                    <Text className="pb-4 opacity-90" variant="subhead">
                      {title}
                    </Text>
                  </AlertDialogPrimitive.Title>
                )}
                {prompt ? (
                  <View className="gap-4 pb-8">
                    <TextField
                      autoFocus
                      blurOnSubmit={prompt.type !== 'login-password'}
                      keyboardType={
                        prompt.type === 'secure-text'
                          ? 'default'
                          : prompt.keyboardType
                      }
                      label={prompt.type === 'login-password' ? 'Email' : ''}
                      labelClassName="bg-card"
                      onChangeText={setText}
                      onSubmitEditing={() => {
                        if (
                          prompt.type === 'login-password' &&
                          passwordRef.current
                        ) {
                          passwordRef.current.focus()
                          return
                        }
                        for (const button of buttons) {
                          if (!button.style || button.style === 'default') {
                            button.onPress?.(text)
                          }
                        }
                        onOpenChange(false)
                      }}
                      secureTextEntry={prompt.type === 'secure-text'}
                      value={text}
                    />
                    {prompt.type === 'login-password' && (
                      <TextField
                        defaultValue={prompt.defaultValue}
                        keyboardType={prompt.keyboardType}
                        label="Password"
                        labelClassName="bg-card"
                        onChangeText={setPassword}
                        onSubmitEditing={() => {
                          for (const button of buttons) {
                            if (!button.style || button.style === 'default') {
                              button.onPress?.(text)
                            }
                          }
                          onOpenChange(false)
                        }}
                        ref={passwordRef}
                        secureTextEntry={prompt.type === 'login-password'}
                        value={password}
                      />
                    )}
                  </View>
                ) : (
                  <View className="h-0.5" />
                )}
                <View
                  className={cn(
                    'flex-row items-center justify-end gap-0.5',
                    buttons.length > 2 && 'justify-between'
                  )}
                >
                  {buttons.map((button, index) => {
                    if (button.style === 'cancel') {
                      return (
                        <View
                          className={cn(
                            buttons.length > 2 &&
                              index === 0 &&
                              'flex-1 items-start'
                          )}
                          key={`${button.text}-${index}`}
                        >
                          <AlertDialogPrimitive.Cancel asChild>
                            <Button
                              onPress={() => {
                                button.onPress?.(
                                  prompt?.type === 'login-password'
                                    ? { login: text, password }
                                    : text
                                )
                              }}
                              variant="plain"
                            >
                              <Text className="text-[14px] font-medium text-primary">
                                {button.text}
                              </Text>
                            </Button>
                          </AlertDialogPrimitive.Cancel>
                        </View>
                      )
                    }
                    if (button.style === 'destructive') {
                      return (
                        <View
                          className={cn(
                            buttons.length > 2 &&
                              index === 0 &&
                              'flex-1 items-start'
                          )}
                          key={`${button.text}-${index}`}
                        >
                          <AlertDialogPrimitive.Action asChild>
                            <Button
                              className="bg-destructive/10 dark:bg-destructive/25"
                              onPress={() => {
                                button.onPress?.(
                                  prompt?.type === 'login-password'
                                    ? { login: text, password }
                                    : text
                                )
                              }}
                              variant="tonal"
                            >
                              <Text className="text-[14px] font-medium text-foreground">
                                {button.text}
                              </Text>
                            </Button>
                          </AlertDialogPrimitive.Action>
                        </View>
                      )
                    }
                    return (
                      <View
                        className={cn(
                          buttons.length > 2 &&
                            index === 0 &&
                            'flex-1 items-start'
                        )}
                        key={`${button.text}-${index}`}
                      >
                        <AlertDialogPrimitive.Action asChild>
                          <Button
                            onPress={() => {
                              button.onPress?.(
                                prompt?.type === 'login-password'
                                  ? { login: text, password }
                                  : text
                              )
                            }}
                            variant="plain"
                          >
                            <Text className="text-[14px] font-medium text-primary">
                              {button.text}
                            </Text>
                          </Button>
                        </AlertDialogPrimitive.Action>
                      </View>
                    )
                  })}
                </View>
              </Animated.View>
            </AlertDialogPrimitive.Content>
          </Animated.View>
        </AlertDialogPrimitive.Overlay>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

Alert.displayName = 'Alert'

function AlertAnchor({ ref }: { ref: React.Ref<AlertMethods> }) {
  return <Alert buttons={[]} ref={ref} title="" />
}

export { Alert, AlertAnchor }
