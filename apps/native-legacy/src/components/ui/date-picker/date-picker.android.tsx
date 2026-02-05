import { cn } from '@native/lib/utils'
import type DateTimePicker from '@react-native-community/datetimepicker'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import type * as React from 'react'
import { View } from 'react-native'
import { Button } from '../button'
import { Text } from '../text'

export function DatePicker(
  props: React.ComponentProps<typeof DateTimePicker> & {
    mode: 'date' | 'time' | 'datetime'
  } & {
    materialDateClassName?: string
    materialDateLabel?: string
    materialDateLabelClassName?: string
    materialTimeClassName?: string
    materialTimeLabel?: string
    materialTimeLabelClassName?: string
  }
) {
  const show = (currentMode: 'time' | 'date') => () => {
    DateTimePickerAndroid.open({
      value: props.value,
      onChange: props.onChange,
      mode: currentMode,
      minimumDate: props.minimumDate,
      maximumDate: props.maximumDate
    })
  }

  return (
    <View className="flex-row gap-2.5">
      {props.mode.includes('date') && (
        <View className={cn('relative pt-1.5', props.materialDateClassName)}>
          <Button
            androidRootClassName="rounded-none"
            className="border-foreground/30 rounded border px-2.5 py-3 active:opacity-80"
            onPress={show('date')}
            variant="plain"
          >
            <Text className="py-px text-sm">
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium'
              }).format(props.value)}
            </Text>
          </Button>
          <View
            className={cn(
              'absolute left-2 top-0 bg-card px-1',
              props.materialDateLabelClassName
            )}
          >
            <Text className="text-[10px] opacity-60" variant="caption2">
              {props.materialDateLabel ?? 'Date'}
            </Text>
          </View>
        </View>
      )}
      {props.mode.includes('time') && (
        <View className={cn('relative pt-1.5', props.materialTimeClassName)}>
          <Button
            androidRootClassName="rounded-none"
            className="border-foreground/30 rounded border px-2.5 py-3 active:opacity-80"
            onPress={show('time')}
            variant="plain"
          >
            <Text className="py-px text-sm">
              {new Intl.DateTimeFormat('en-US', {
                timeStyle: 'short'
              }).format(props.value)}
            </Text>
          </Button>
          <View
            className={cn(
              'absolute left-2 top-0 bg-card px-1',
              props.materialTimeLabelClassName
            )}
          >
            <Text className="text-[10px] opacity-60" variant="caption2">
              {props.materialTimeLabel ?? 'Time'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
