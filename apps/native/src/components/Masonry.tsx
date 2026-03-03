import { Link } from 'expo-router'
import { Image, Pressable, View } from 'react-native'

export const MasonryGrid = ({ images }: { images: any[] }) => {
  // Split images into three columns
  const leftColumn = images.filter((_, index) => index % 3 === 0)
  const middleColumn = images.filter((_, index) => index % 3 === 1)
  const rightColumn = images.filter((_, index) => index % 3 === 2)

  return (
    <View className="flex-row">
      {/* Left Column */}
      <View className="flex-1 pr-0">
        {leftColumn.map((image) => (
          <MasonryItem image={image} key={image.id} />
        ))}
      </View>

      {/* Middle Column */}
      <View className="flex-1 px-2">
        {middleColumn.map((image) => (
          <MasonryItem image={image} key={image.id} />
        ))}
      </View>

      {/* Right Column */}
      <View className="flex-1 pl-0">
        {rightColumn.map((image) => (
          <MasonryItem image={image} key={image.id} />
        ))}
      </View>
    </View>
  )
}

export const MasonryItem = ({ image }: { image: any }) => {
  return (
    <Link asChild href="/screens/post-detail">
      <Pressable className="mb-2 rounded-xl overflow-hidden">
        <Image
          resizeMode="cover"
          source={{ uri: image.uri }}
          style={{
            width: '100%',
            height: image.height
            //borderRadius: 12
          }}
        />
      </Pressable>
    </Link>
  )
}
