import { useEffect, useRef } from 'react'
import {
  Animated,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle
} from 'react-native'

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
    <View style={styles.container}>
      {/* Banner Skeleton */}
      <ShimmerView shimmerAnimation={shimmerAnimation} style={styles.banner} />

      {/* Avatar Skeleton */}
      <ShimmerView shimmerAnimation={shimmerAnimation} style={styles.avatar} />

      {/* Profile Info Skeleton */}
      <View style={styles.profileInfo}>
        <ShimmerView
          shimmerAnimation={shimmerAnimation}
          style={styles.nameLine}
        />
        <ShimmerView
          shimmerAnimation={shimmerAnimation}
          style={styles.usernameLine}
        />
        <ShimmerView
          shimmerAnimation={shimmerAnimation}
          style={styles.bioLine}
        />
        <ShimmerView
          shimmerAnimation={shimmerAnimation}
          style={styles.badgesLine}
        />
      </View>

      {/* Clubs Skeleton */}
      <View style={styles.clubsSection}>
        <ShimmerView
          shimmerAnimation={shimmerAnimation}
          style={styles.sectionHeader}
        />
        <View style={styles.clubsGrid}>
          <ShimmerView
            shimmerAnimation={shimmerAnimation}
            style={styles.clubCard}
          />
          <ShimmerView
            shimmerAnimation={shimmerAnimation}
            style={styles.clubCard}
          />
        </View>
      </View>
    </View>
  )
}

const ShimmerView = ({
  style,
  shimmerAnimation
}: {
  style: StyleProp<ViewStyle>
  shimmerAnimation: Animated.Value
}) => {
  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  })

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: shimmerOpacity
        }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  banner: {
    height: 120,
    backgroundColor: '#e0e0e0'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginTop: -40,
    borderWidth: 4,
    borderColor: '#fff'
  },
  profileInfo: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8
  },
  nameLine: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
    alignSelf: 'center'
  },
  usernameLine: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    width: '40%',
    alignSelf: 'center'
  },
  bioLine: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
    alignSelf: 'center'
  },
  badgesLine: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    width: '50%',
    alignSelf: 'center'
  },
  clubsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8
  },
  sectionHeader: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
    width: '40%'
  },
  clubsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  clubCard: {
    width: '48%',
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8
  }
})
