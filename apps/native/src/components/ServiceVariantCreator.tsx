import useThemeColors from '@rov/app/contexts/ThemeColors'
import type React from 'react'
import { useState } from 'react'
import {
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View
} from 'react-native'
import { Button } from './Button'
import Input from './forms/Input'
import Icon from './Icon'
import ThemedText from './ThemedText'

type ServiceVariantCreatorProps = {
  hasStock?: boolean
}

type Option = {
  name: string
  values: string[]
}

interface Variant extends Record<string, string | null> {
  price: string
  deliveryDays: string
  image: null
}

const ServiceVariantCreator: React.FC<ServiceVariantCreatorProps> = ({
  hasStock
}) => {
  const colors = useThemeColors()
  const [options, setOptions] = useState<Option[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [currentOption, setCurrentOption] = useState<Option>({
    name: '',
    values: ['']
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addOption = () => {
    if (options.length < 3) {
      setModalVisible(true)
      setCurrentOption({ name: '', values: [''] })
      setEditingIndex(null)
    }
  }

  const editOption = (index: number) => {
    setCurrentOption(options[index])
    setEditingIndex(index)
    setModalVisible(true)
  }

  const handleSaveOption = () => {
    const trimmedValues = currentOption.values.filter((v) => v.trim())

    if (!currentOption.name.trim()) {
      Alert.alert(
        'Missing Option Name',
        'Please enter an option name before saving.'
      )
      return
    }

    if (trimmedValues.length === 0) {
      Alert.alert(
        'Missing Values',
        'Please enter at least one value before saving.'
      )
      return
    }

    const updatedOptions = [...options]
    if (editingIndex !== null) {
      updatedOptions[editingIndex] = {
        ...currentOption,
        values: trimmedValues
      }
    } else {
      updatedOptions.push({ ...currentOption, values: trimmedValues })
    }

    setOptions(updatedOptions)
    setModalVisible(false)
    generateVariants(updatedOptions)
  }

  const addValue = () => {
    // Adds a new empty value to the current option values
    setCurrentOption((prevOption) => ({
      ...prevOption,
      values: [...prevOption.values, '']
    }))
  }
  const deleteOption = () => {
    if (editingIndex === null) return
    const updatedOptions = [...options]
    updatedOptions.splice(editingIndex, 1) // Removes the option at the index being edited
    setOptions(updatedOptions)
    setModalVisible(false)
    generateVariants(updatedOptions) // Update variants after deleting an option
  }

  const removeValue = (index: number) => {
    const updatedValues = [...currentOption.values]
    updatedValues.splice(index, 1)
    setCurrentOption({
      ...currentOption,
      values: updatedValues.length ? updatedValues : ['']
    })
  }

  const generateVariants = (updatedOptions: Option[]) => {
    const combinations = updatedOptions.reduce(
      (acc: Record<string, string>[], option) => {
        if (acc.length === 0)
          return option.values.map((v) => ({ [option.name]: v }))
        return acc.flatMap((prev) =>
          option.values.map((value) => ({ ...prev, [option.name]: value }))
        )
      },
      []
    )
    setVariants(
      combinations.map((variant) => ({
        ...variant,
        price: '',
        deliveryDays: '',
        image: null
      }))
    )
  }

  return (
    <>
      <View
        className={`mb-2  border-neutral-400 rounded-xl mt-2 overflow-hidden ${options.length > 0 ? 'border' : ''}`}
      >
        {options.map((option, index) => (
          <Pressable
            className="p-4 border-b border-neutral-300 -mb-px"
            key={index}
            onPress={() => editOption(index)}
          >
            <View className="flex-row justify-between items-center">
              <ThemedText className="font-semibold">{option.name}</ThemedText>
              <View className="rounded-lg">
                <Icon name="Edit" size={20} />
              </View>
            </View>
            <View className="flex-row flex-wrap gap-1 mt-1">
              {option.values.map((value, i) => (
                <View
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                  key={i}
                >
                  <ThemedText className="text-sm" key={i}>
                    {value}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </View>
      {options.length < 3 ? (
        <Pressable
          className=" py-3 px-4 rounded-lg border border-neutral-400 items-center flex-row justify-center relative z-50" // Calls addValue to add a new empty input
          onPress={addOption}
        >
          <Icon name="Plus" size={20} />
          <Text className="dark:text-white ml-2">Add option </Text>
        </Pressable>
      ) : (
        <View className=" py-3 px-4 rounded-lg bg-neutral-100 items-center flex-row justify-center relative z-50">
          <Text className="dark:text-white text-neutral-400">
            You've reached 3 options limit{' '}
          </Text>
        </View>
      )}

      {variants.length > 0 && (
        <View className="mt-4">
          <Text className="dark:text-white text-xl font-medium mt-0 mb-2">
            Service Packages
          </Text>
          {variants.map((variant, index) => (
            <View
              className="border border-neutral-400 p-2 rounded-lg mb-2"
              key={index}
            >
              <View className="flex-row justify-start items-center">
                <Text className="ml-2">
                  {Object.values(variant).slice(0, -3).join(' / ')}
                </Text>
                <View className="flex-row ml-auto">
                  <View className="w-[80px]">
                    <Input
                      containerClassName="mb-0"
                      keyboardType="numeric"
                      label="Price"
                      onChangeText={(text) => {
                        const updatedVariants = [...variants]
                        updatedVariants[index].price = text
                        setVariants(updatedVariants)
                      }}
                      value={variant.price}
                    />
                  </View>
                  <Input
                    className="h-[55px]"
                    containerClassName="mb-0 w-20 ml-2"
                    keyboardType="numeric"
                    label="Days"
                    onChangeText={(text) => {
                      const updatedVariants = [...variants]
                      updatedVariants[index].deliveryDays = text
                      setVariants(updatedVariants)
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal animationType="slide" transparent visible={modalVisible}>
        <SafeAreaView className="flex-1 bg-background dark:bg-dark-primary">
          <View className="flex-1 w-full bg-background dark:bg-dark-primary">
            <View className="flex-row w-full justify-between px-4">
              <Pressable
                className="w-12 h-12 rounded-full items-start justify-center"
                onPress={() => setModalVisible(false)}
              >
                <Icon name="X" size={25} />
              </Pressable>

              <View className="flex-row">
                <Pressable
                  className="w-12 h-12  rounded-full items-center justify-center"
                  onPress={() => {
                    Alert.alert(
                      'Delete Option',
                      'Are you sure you want to delete this option?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => deleteOption()
                        }
                      ]
                    )
                  }}
                >
                  <Icon name="Trash" size={18} />
                </Pressable>
                <Button
                  className="bg-black dark:bg-white px-6  items-center ml-2 justify-center"
                  onPress={handleSaveOption}
                  size="medium"
                  title="Save"
                />
              </View>
            </View>
            <View className="flex-1 mt-8">
              <View className="px-4  w-full">
                <ThemedText className=" text-xl font-medium">
                  Option name
                </ThemedText>
                <ThemedText className="text-sm w-full mb-4">
                  Package type, delivery time, revisions
                </ThemedText>
                <Input
                  label="Name"
                  onChangeText={(text) =>
                    setCurrentOption({ ...currentOption, name: text })
                  }
                  value={currentOption.name}
                />
                <ThemedText className="text-xl font-medium mt-8">
                  Values
                </ThemedText>
                <ThemedText className="text-light-subtext dark:text-dark-subtext text-sm w-full">
                  Basic, Standard, Premium, etc.
                </ThemedText>
                <FlatList
                  className="mt-4 border border-neutral-500 rounded-lg relative"
                  data={currentOption.values}
                  keyExtractor={(_item, index) => index.toString()}
                  ListFooterComponent={
                    <Pressable
                      className="py-3 px-4 rounded-lg items-center flex-row justify-center"
                      onPress={addValue}
                    >
                      <Icon name="Plus" size={20} />
                      <ThemedText className="ml-2">Add value</ThemedText>
                    </Pressable>
                  }
                  renderItem={({ item, index }) => (
                    <View className="flex-row items-center border-b border-neutral-500">
                      <TextInput
                        className="flex-1 py-3 px-4 dark:text-white dark:placeholder:text-white"
                        onChangeText={(text) => {
                          const updatedValues = currentOption.values.map(
                            (val, i) => (i === index ? text : val)
                          )

                          // If the user is typing in the last input, add a new empty one
                          if (
                            index === updatedValues.length - 1 &&
                            text !== ''
                          ) {
                            updatedValues.push('')
                          }

                          setCurrentOption({
                            ...currentOption,
                            values: updatedValues
                          })
                        }}
                        onSubmitEditing={Keyboard.dismiss}
                        placeholder="Enter value"
                        placeholderTextColor={colors.placeholder}
                        value={item}
                      />
                      <Pressable
                        className="px-3"
                        onPress={() => removeValue(index)}
                      >
                        <Icon name="Trash" size={20} />
                      </Pressable>
                    </View>
                  )}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  )
}

export default ServiceVariantCreator
