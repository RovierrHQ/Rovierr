import ThemedText from '@rov/components/ThemedText'
import React, { useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View
} from 'react-native'

type ImageCarouselProps = {
  images: string[] | ImageSourcePropType[]
  width?: number
  height?: number
  showPagination?: boolean
  paginationStyle?: 'dots' | 'numbers'
  onImagePress?: (index: number) => void
  autoPlay?: boolean
  autoPlayInterval?: number
  loop?: boolean
  className?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  width: propWidth,
  height = 200,
  showPagination = true,
  paginationStyle = 'dots',
  onImagePress,
  autoPlay = false,
  autoPlayInterval = 3000,
  loop = true,
  className = '',
  rounded = 'none'
}) => {
  const [containerWidth, setContainerWidth] = useState(
    propWidth || Dimensions.get('window').width
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = React.useRef<FlatList>(null)

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setContainerWidth(width)
  }

  const getRoundedClass = () => {
    switch (rounded) {
      case 'none':
        return ''
      case 'sm':
        return 'rounded-sm'
      case 'md':
        return 'rounded-md'
      case 'lg':
        return 'rounded-lg'
      case 'xl':
        return 'rounded-xl'
      case '2xl':
        return 'rounded-2xl'
      case 'full':
        return 'rounded-full'
      default:
        return ''
    }
  }

  const handleImageChange = (contentOffsetX: number) => {
    const index = Math.round(contentOffsetX / containerWidth)
    setActiveIndex(index)
  }

  const handleImagePress = () => {
    if (onImagePress) {
      onImagePress(activeIndex)
    }
  }

  const renderPagination = () => {
    if (!showPagination || images.length <= 1) return null

    return (
      <View className="flex-row justify-center absolute bottom-4 w-full">
        {paginationStyle === 'dots' ? (
          images.map((_, index) => (
            <View
              className={`h-2 w-2 rounded-full mx-1 ${
                index === activeIndex ? 'bg-white' : 'bg-white/40'
              }`}
              key={index}
            />
          ))
        ) : (
          <View className="bg-black/50 px-3 py-1 rounded-full">
            <ThemedText className="text-white">
              {activeIndex + 1} / {images.length}
            </ThemedText>
          </View>
        )}
      </View>
    )
  }

  const renderItem = ({
    item,
    index
  }: {
    item: string | ImageSourcePropType
    index: number
  }) => (
    <Pressable
      onPress={handleImagePress}
      style={{ width: containerWidth, height }}
    >
      <Image
        resizeMode="cover"
        source={typeof item === 'string' ? { uri: item } : item}
        style={[
          styles.image,
          {
            width: containerWidth,
            height
          }
        ]}
      />
    </Pressable>
  )

  return (
    <View
      className={`${getRoundedClass()} ${className}`}
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          height,
          overflow: 'hidden'
        }
      ]}
    >
      <FlatList
        contentContainerStyle={{ width: containerWidth * images.length }}
        data={images}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={(e) => {
          const contentOffsetX = e.nativeEvent.contentOffset.x
          handleImageChange(contentOffsetX)
        }}
        pagingEnabled
        ref={flatListRef}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        style={{ height }}
      />
      {renderPagination()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  image: {
    backgroundColor: '#f0f0f0'
  }
})

export default ImageCarousel
