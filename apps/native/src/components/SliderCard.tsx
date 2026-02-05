import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import useThemeColors from '@rov/app/contexts/ThemeColors'
import { type Href, Link } from 'expo-router'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import ImageCarousel from './ImageCarousel'
import ThemedText from './ThemedText'

const _windowWidth = Dimensions.get('window').width

type SliderCardProps = {
  title: string
  description?: string
  image: string | string[]
  href: Href
  className?: string
  button?: string
  rating?: string
  distance?: number
  price?: string
}

const SliderCard = ({
  title,
  description,
  image,
  href,
  rating,
  distance,
  price,
  className = '',
  ...props
}: SliderCardProps) => {
  const colors = useThemeColors()
  const images = Array.isArray(image) ? image : [image]

  return (
    <View
      className={`p-global mb-0 bg-background dark:bg-dark-primary w-full ${className}`}
      {...props}
    >
      <View className="w-full relative">
        <ImageCarousel
          className="rounded-2xl"
          height={300}
          //width={windowWidth - 32}
          images={images}
          rounded="xl"
        />
      </View>
      <Link asChild href={href}>
        <TouchableOpacity>
          <View className="flex-row w-full items-center mt-2 justify-between">
            <ThemedText className="text-base font-semibold">{title}</ThemedText>
            {rating && (
              <View className="flex-row items-center">
                <MaterialIcons color={colors.text} name="star" size={18} />
                <ThemedText className="text-base ml-px">{rating}</ThemedText>
              </View>
            )}
          </View>
          <Text className="text-sm text-light-subtext dark:text-dark-subtext">
            {distance} miles away
          </Text>
          <ThemedText className="text-base font-bold mt-2">
            {price} <ThemedText className="font-normal">night</ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </Link>
    </View>
  )
}

export default SliderCard
