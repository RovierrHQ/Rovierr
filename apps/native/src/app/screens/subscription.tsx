import ActionSheetThemed from '@rov/components/ActionSheetThemed'
import { Button } from '@rov/components/Button'
import Switch from '@rov/components/forms/Switch'
import Header from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import ThemedFooter from '@rov/components/ThemeFooter'
import ThemedScroller from '@rov/components/ThemeScroller'
import { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import useThemeColors from '../../contexts/ThemeColors'

export default function EditProfileScreen() {
  const [selectedPlan, setSelectedPlan] = useState('Monthly')
  const actionSheetRef = useRef<ActionSheetRef>(null)
  return (
    <>
      <View className="flex-1 bg-background">
        <Header showBackButton />
        <ThemedScroller>
          <View className="w-full my-10  items-center">
            <ThemedText className="font-semibold text-4xl text-center ">
              Unlock premium features
            </ThemedText>
            <ThemedText className="text-lg font-light mt-1 text-center">
              Unlock all premium features
            </ThemedText>
          </View>
          <View className=" items-start w-[240px] mx-auto mb-14">
            <CheckItem active={true} title="No ads" />
            <CheckItem active={true} title="Unlimited content access" />
            <CheckItem active={true} title="Offline access" />
          </View>

          <SubscriptionCard
            active={selectedPlan === 'Weekly'}
            description="Unlock all premium features"
            icon="Star"
            onPress={() => setSelectedPlan('Weekly')}
            price="$19.99"
            title="Weekly"
          />
          <SubscriptionCard
            active={selectedPlan === 'Monthly'}
            description="All premium features + goal tracker"
            discount="20%"
            icon="Trophy"
            onPress={() => setSelectedPlan('Monthly')}
            price="$29.99"
            title="Monthly"
          />
          <SubscriptionCard
            active={selectedPlan === 'Yearly'}
            description="All premium features + goal tracker + 1000+ recipes"
            discount="50%"
            icon="Medal"
            onPress={() => setSelectedPlan('Yearly')}
            price="$199.99"
            title="Yearly"
          />
          <Switch className="mb-4 mt-4" label="Enable auto renew" />
        </ThemedScroller>
        <ThemedFooter>
          <ThemedText className="text-sm font-light text-center mb-4">
            1 month free trial then $29.99/month
          </ThemedText>
          <Button
            className="!bg-highlight"
            onPress={() => actionSheetRef.current?.show()}
            rounded="full"
            size="large"
            textClassName="!text-black"
            title="Upgrade to plus"
          />
        </ThemedFooter>
      </View>
      <ActionSheetThemed
        containerStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 10
        }}
        gestureEnabled
        id="subscription-success"
        ref={actionSheetRef}
      >
        <View className="px-6 pt-10 items-center">
          <Icon
            className="w-20 h-20 bg-background rounded-full mb-6"
            name="Check"
            size={24}
          />
          <ThemedText className="font-semibold text-4xl">All setup</ThemedText>
          <ThemedText className="text-lg text-center px-14 font-light mt-2 mb-32">
            Hope you are satisfied. We will update you for the next subscription
            date.
          </ThemedText>
          <Button
            className="!bg-highlight !px-10"
            onPress={() => actionSheetRef.current?.hide()}
            rounded="full"
            size="large"
            textClassName="!text-black"
            title="Upgrade to plus"
          />
        </View>
      </ActionSheetThemed>
    </>
  )
}

const SubscriptionCard = (props: {
  active: boolean
  description: string
  discount?: string
  icon: string
  onPress: () => void
  price: string
  title: string
}) => {
  const _colors = useThemeColors()
  return (
    <Pressable
      className={`bg-secondary rounded-2xl relative flex-row items-center border mb-4 ${props.active ? 'border-highlight' : ' border-transparent'}`}
      onPress={props.onPress}
    >
      <View className="py-6 px-6  flex-1 flex-row justify-start items-center">
        {props.icon && (
          <Icon
            className={`rounded-full border w-8 h-8 mr-3 ${props.active ? 'bg-highlight border-highlight' : 'bg-transparent border-border'}`}
            color={props.active ? 'black' : 'transparent'}
            name="Check"
            size={18}
            strokeWidth={3}
          />
        )}

        <ThemedText className="font-semibold text-xl">{props.title}</ThemedText>
        {props.discount && (
          <ThemedText className="text-xs font-semibold bg-background text-highlight rounded-full px-2 py-1  ml-2">
            {props.discount} off
          </ThemedText>
        )}
        <ThemedText className="text-lg  ml-auto">{props.price}</ThemedText>
      </View>
    </Pressable>
  )
}

const CheckItem = (props: { active: boolean; title: string }) => {
  return (
    <View className="flex-row items-center my-3">
      <Icon
        className={`rounded-full w-7 h-7 mr-3 ${props.active ? 'bg-lime-500/20' : 'bg-transparent'}`}
        color={props.active ? 'white' : 'transparent'}
        name="Check"
        size={15}
        strokeWidth={3}
      />
      <ThemedText className="font-semibold text-xl">{props.title}</ThemedText>
    </View>
  )
}
