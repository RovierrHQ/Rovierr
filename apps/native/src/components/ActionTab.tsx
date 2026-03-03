import { Link } from 'expo-router'
import { useRef } from 'react'
import { Pressable, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import ActionSheetThemed from './ActionSheetThemed'
import Icon from './Icon'
import Grid from './layout/Grid'
import ThemedText from './ThemedText'

const ActionTab = () => {
  const actionSheetRef = useRef<ActionSheetRef>(null)

  const handlePress = () => {
    actionSheetRef.current?.show()
  }

  return (
    <>
      <View className="relative flex flex-col items-center justify-center">
        <Pressable
          className="w-16 h-16  -translate-y-2  bg-highlight rounded-full flex items-center justify-center"
          onPress={handlePress}
        >
          <Icon color="white" name="Plus" size={20} strokeWidth={2} />
        </Pressable>
      </View>
      <ActionSheetThemed
        containerStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 10
        }}
        gestureEnabled
        id="action-tab-sheet"
        ref={actionSheetRef}
      >
        <View className="p-global">
          <Grid columns={2} spacing={10}>
            <ActionItem
              href="/screens/add-workout"
              icon="BicepsFlexed"
              label="Workout"
              onPress={() => actionSheetRef.current?.hide()}
            />
            <ActionItem
              href="/screens/add-meal"
              icon="Apple"
              label="Meal"
              onPress={() => actionSheetRef.current?.hide()}
            />
            <ActionItem
              href="/screens/add-water"
              icon="Droplet"
              label="Water"
              onPress={() => actionSheetRef.current?.hide()}
            />
            <ActionItem
              href="/screens/add-weight"
              icon="Scale"
              label="Weight"
              onPress={() => actionSheetRef.current?.hide()}
            />
          </Grid>
        </View>
      </ActionSheetThemed>
    </>
  )
}

const ActionItem = (props: any) => {
  return (
    <Link asChild href={props.href}>
      <Pressable
        className="py-10 rounded-2xl bg-background flex-col flex items-center justify-start"
        onPress={props.onPress}
      >
        <Icon
          className="w-14 h-14 bg-highlight mb-2 rounded-full"
          color="white"
          name={props.icon}
          size={20}
          strokeWidth={2}
        />
        <ThemedText className="text-base">{props.label}</ThemedText>
      </Pressable>
    </Link>
  )
}

export default ActionTab
