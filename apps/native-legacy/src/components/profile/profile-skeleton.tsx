import { useEffect, useRef } from 'react'
import { Animated, type StyleProp, View, type ViewStyle } from 'react-native'

export function ProfileSkeleton() {
  const shimmerAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ]).start(() => shimmer())
    }
    shimmer()
  }, [shimmerAnimation])

  return (
    <View className="flex-1 bg-[#F5F5F5] dark:bg-black">
      {/* Banner Skeleton */}
      <ShimmerView
        className="h-[120px] bg-[#E0E0E0] dark:bg-[#374151]"
        shimmerAnimation={shimmerAnimation}
      />

      {/* Avatar Skeleton */}
      <ShimmerView
        className="w-20 h-20 rounded-full bg-[#E0E0E0] dark:bg-[#374151] self-center -mt-10 border-4 border-white dark:border-black"
        shimmerAnimation={shimmerAnimation}
      />

      {/* Profile Info Skeleton */}
      <View className="p-4 bg-white dark:bg-black mt-2">
        <ShimmerView
          className="h-6 bg-[#E0E0E0] dark:bg-[#374151] rounded mb-2 w-[60%] self-center"
          shimmerAnimation={shimmerAnimation}
        />
        <ShimmerView
          className="h-4 bg-[#E0E0E0] dark:bg-[#374151] rounded mb-2 w-[40%] self-center"
          shimmerAnimation={shimmerAnimation}
        />
        <ShimmerView
          className="h-4 bg-[#E0E0E0] dark:bg-[#374151] rounded mb-2 w-[80%] self-center"
          shimmerAnimation={shimmerAnimation}
        />
        <ShimmerView
          className="h-6 bg-[#E0E0E0] dark:bg-[#374151] rounded-xl w-[50%] self-center"
          shimmerAnimation={shimmerAnimation}
        />
      </View>

      {/* Clubs Skeleton */}
      <View className="p-4 bg-white dark:bg-black mt-2">
        <ShimmerView
          className="h-5 bg-[#E0E0E0] dark:bg-[#374151] rounded mb-4 w-[40%]"
          shimmerAnimation={shimmerAnimation}
        />
        <View className="flex-row justify-between">
          <ShimmerView
            className="w-[48%] h-20 bg-[#E0E0E0] dark:bg-[#374151] rounded-lg"
            shimmerAnimation={shimmerAnimation}
          />
          <ShimmerView
            className="w-[48%] h-20 bg-[#E0E0E0] dark:bg-[#374151] rounded-lg"
            shimmerAnimation={shimmerAnimation}
          />
        </View>
      </View>
    </View>
  )
}

const ShimmerView = ({
  style,
  shimmerAnimation,
  className
}: {
  style?: StyleProp<ViewStyle>
  shimmerAnimation: Animated.Value
  className?: string
}) => {
  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  })

  return (
    <Animated.View
      className={className}
      style={[
        style,
        {
          opacity: shimmerOpacity
        }
      ]}
    />
  )
}
