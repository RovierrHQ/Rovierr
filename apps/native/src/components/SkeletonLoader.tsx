import useThemeColors from '@rov/contexts/ThemeColors'
import React from 'react'
import { Animated, Dimensions, Easing, View } from 'react-native'

const windowWidth = Dimensions.get('window').width

type SkeletonVariant = 'list' | 'grid' | 'article' | 'chat'

type SkeletonLoaderProps = {
  variant: SkeletonVariant
  count?: number
  className?: string
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  count = 1,
  className = ''
}) => {
  const colors = useThemeColors()
  const animatedValue = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false
        })
      ])
    ).start()

    return () => {
      animatedValue.stopAnimation()
    }
  }, [animatedValue])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  })

  const renderListItem = () => (
    <View className="flex-row items-center py-4 ">
      <Animated.View
        className="w-16 h-16 rounded-lg"
        style={[{ opacity, backgroundColor: colors.secondary }]}
      />
      <View className="ml-3 flex-1">
        <Animated.View
          className="h-5 rounded-md mb-2 w-3/4"
          style={[{ opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          className="h-4 rounded-md w-1/2"
          style={[{ opacity, backgroundColor: colors.secondary }]}
        />
      </View>
    </View>
  )

  const renderGridItem = () => (
    <View className="w-1/2 p-2">
      <Animated.View
        className="aspect-square rounded-lg mb-2"
        style={[{ opacity, backgroundColor: colors.secondary }]}
      />
      <Animated.View
        className="h-4 rounded-md mb-1 w-3/4"
        style={[{ opacity, backgroundColor: colors.secondary }]}
      />
      <Animated.View
        className="h-4 rounded-md w-1/2"
        style={[{ opacity, backgroundColor: colors.secondary }]}
      />
    </View>
  )

  const renderArticle = () => (
    <View className="flex-1">
      <Animated.View
        style={[
          {
            opacity,
            backgroundColor: colors.secondary,
            width: windowWidth,
            height: windowWidth
          }
        ]}
      />
      <View className="p-4 flex-1">
        <Animated.View
          className="h-8 rounded-md mb-4 w-3/4"
          style={[{ opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          className="h-6 rounded-md mb-4 w-1/2"
          style={[{ opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          className="h-4 rounded-md mb-2 w-full"
          style={[{ opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          className="h-4 rounded-md mb-2 w-full"
          style={[{ opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          className="h-4 rounded-md w-3/4"
          style={[{ opacity, backgroundColor: colors.secondary }]}
        />
      </View>
    </View>
  )

  const renderChat = () => (
    <View className="p-4">
      <View className="flex-row justify-start mb-4">
        <View className="w-3/4">
          <Animated.View
            className="h-12 rounded-2xl"
            style={[{ opacity, backgroundColor: colors.secondary }]}
          />
        </View>
      </View>
      <View className="flex-row justify-end mb-4">
        <View className="w-3/4">
          <Animated.View
            className="h-16 rounded-2xl"
            style={[{ opacity, backgroundColor: colors.secondary }]}
          />
        </View>
      </View>
      <View className="flex-row justify-start">
        <View className="w-2/4">
          <Animated.View
            className="h-12 rounded-2xl"
            style={[{ opacity, backgroundColor: colors.secondary }]}
          />
        </View>
      </View>
    </View>
  )

  const renderContent = () => {
    switch (variant) {
      case 'list':
        return new Array(count)
          .fill(null)
          .map((_, index) => (
            <React.Fragment key={index}>{renderListItem()}</React.Fragment>
          ))
      case 'grid':
        return (
          <View className="flex-row flex-wrap">
            {new Array(count).fill(null).map((_, index) => (
              <React.Fragment key={index}>{renderGridItem()}</React.Fragment>
            ))}
          </View>
        )
      case 'article':
        return renderArticle()
      case 'chat':
        return renderChat()
      default:
        return null
    }
  }

  return (
    <View className={`flex-1 bg-background dark:bg-dark-primary ${className}`}>
      {renderContent()}
    </View>
  )
}

export default SkeletonLoader
