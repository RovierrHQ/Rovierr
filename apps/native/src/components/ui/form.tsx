import { useColorScheme } from '@native/lib/use-color-scheme'
import { cn } from '@native/lib/utils'
import * as React from 'react'
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native'
import { Icon } from './icon'
import type { IconProps } from './icon/types'
import { Text } from './text'

function Form({ className, ...props }: ViewProps) {
  return <View className={cn('gap-9', className)} {...props} />
}

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: 'continuous'
}

type FormSectionProps = ViewProps & {
  rootClassName?: string
  footnote?: string
  footnoteClassName?: string
  ios?: {
    title: string
    titleClassName?: string
  }
  materialIconProps?: IconProps['materialCommunityIcon']
}

function FormSection({
  rootClassName,
  className,
  footnote,
  footnoteClassName,
  ios,
  materialIconProps,
  style = BORDER_CURVE,
  children: childrenProps,
  ...props
}: FormSectionProps) {
  const { colors } = useColorScheme()
  const children = React.useMemo(() => {
    if (Platform.OS !== 'ios') return childrenProps
    const childrenArray = React.Children.toArray(childrenProps)
    // Add isLast prop to last child
    return React.Children.map(childrenArray, (child, index) => {
      if (!React.isValidElement(child)) return child
      const isLast = index === childrenArray.length - 1
      if (typeof child === 'string') {
        console.log('FormSection - Invalid asChild element', child)
      }
      return React.cloneElement<ViewProps & { isLast?: boolean }, View>(
        // biome-ignore lint/complexity/noUselessFragments: nativewindui
        typeof child === 'string' ? <></> : child,
        { isLast }
      )
    })
  }, [childrenProps])

  return (
    <View
      className={cn(
        'relative',
        Platform.OS !== 'ios' && !!materialIconProps && 'flex-row gap-4',
        rootClassName
      )}
    >
      {Platform.OS === 'ios' && !!ios?.title && (
        <Text
          className={cn(
            'pb-1 pl-3 uppercase text-muted-foreground',
            ios?.titleClassName
          )}
          variant="footnote"
        >
          {ios.title}
        </Text>
      )}
      {!!materialIconProps && (
        <View className="ios:hidden pt-0.5">
          <Icon
            color={colors.grey}
            materialCommunityIcon={materialIconProps}
            sfSymbol={{ name: 'questionmark' }}
          />
        </View>
      )}
      <View
        className={cn(
          !!materialIconProps && Platform.OS === 'android' && 'flex-1'
        )}
      >
        <View
          children={children}
          className={cn(
            'ios:overflow-hidden ios:rounded-lg ios:bg-card ios:gap-0 ios:pl-1 gap-4',
            className
          )}
          style={style}
          {...props}
        />
        {!!footnote && (
          <Text
            className={cn(
              'ios:pl-3 ios:pt-1 pl-3 pt-0.5 text-muted-foreground',
              footnoteClassName
            )}
            variant="footnote"
          >
            {footnote}
          </Text>
        )}
      </View>
    </View>
  )
}

function FormItem({
  className,
  isLast,
  iosSeparatorClassName,
  ...props
}: ViewProps & {
  isLast?: boolean
  iosSeparatorClassName?: string
}) {
  return (
    <>
      <View className={cn('ios:pr-1', className)} {...props} />
      {Platform.OS === 'ios' && !isLast && (
        <View
          className={cn('ml-2 h-px w-full bg-border', iosSeparatorClassName)}
        />
      )}
    </>
  )
}

export { Form, FormItem, FormSection }
