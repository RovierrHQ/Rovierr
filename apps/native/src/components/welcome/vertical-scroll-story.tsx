import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View
} from 'react-native'
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const screens = [
  {
    image: require('../../assets/images/school6.jpg'),
    title: 'Your Campus',
    subtitle: 'Connect with students across universities worldwide'
  },
  {
    image: require('../../assets/images/school4.jpg'),
    title: 'Life Unified',
    subtitle: 'Collaborate, learn, and grow beyond campus boundaries'
  }
]

export default function VerticalScrollStory() {
  const { top, bottom } = useSafeAreaInsets()
  const router = useRouter()
  const scrollViewRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Animated bounce for scroll indicator
  const translateY = useSharedValue(0)

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      false
    )
  }, [translateY])

  const scrollIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }))

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y
    const index = Math.round(offsetY / SCREEN_HEIGHT)
    setCurrentIndex(index)
  }

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={handleScroll}
        pagingEnabled
        ref={scrollViewRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {screens.map((screen, index) => (
          <View
            key={`screen-${index}`}
            style={[styles.screen, { height: SCREEN_HEIGHT }]}
          >
            <Image source={screen.image} style={styles.backgroundImage} />
            <View style={styles.overlay} />
            <View
              style={[styles.textContainer, { paddingBottom: bottom + 120 }]}
            >
              <Animated.View entering={FadeInUp.delay(300).springify()}>
                <Animated.Text style={styles.title}>
                  {screen.title}
                </Animated.Text>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(500).springify()}>
                <Animated.Text style={styles.subtitle}>
                  {screen.subtitle}
                </Animated.Text>
              </Animated.View>
            </View>

            {/* Scroll Indicator - only show on first two screens */}
            {index < 2 && currentIndex === index && (
              <Animated.View
                entering={FadeInDown.delay(1000)}
                style={[styles.scrollIndicator, { bottom: bottom + 40 }]}
              >
                <Animated.View style={scrollIndicatorStyle}>
                  <Animated.Text style={styles.scrollText}>
                    Swipe up
                  </Animated.Text>
                  <Animated.Text style={styles.scrollArrow}>↓</Animated.Text>
                </Animated.View>
              </Animated.View>
            )}
          </View>
        ))}

        {/* Final CTA Screen */}
        <View style={[styles.screen, { height: SCREEN_HEIGHT }]}>
          <Image
            source={require('../../assets/images/school2.jpg')}
            style={styles.backgroundImage}
          />
          <View style={styles.overlay} />
          <View style={[styles.ctaContainer, { paddingBottom: bottom + 60 }]}>
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <Animated.Text style={styles.ctaTitle}>
                Join the global student network
              </Animated.Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Animated.Text
                onPress={handleGetStarted}
                style={styles.getStartedButton}
              >
                Get Started
              </Animated.Text>
            </Animated.View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Pagination Dots */}
      <View style={[styles.pagination, { top: top + 20 }]}>
        {[0, 1, 2].map((index) => (
          <View
            key={`dot-${index}`}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  scrollView: {
    flex: 1
  },
  screen: {
    width: SCREEN_WIDTH,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: 'cover'
  },
  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 28,
    paddingHorizontal: 20
  },
  scrollIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center'
  },
  scrollText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    opacity: 0.9
  },
  scrollArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  ctaContainer: {
    alignItems: 'center',
    paddingHorizontal: 40
  },
  ctaTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    color: '#0C1824',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 12,
    overflow: 'hidden'
  },
  pagination: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    height: 24
  }
})
