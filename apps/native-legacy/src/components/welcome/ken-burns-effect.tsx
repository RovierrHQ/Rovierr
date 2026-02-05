import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function KenBurnsEffect() {
  const { top, bottom } = useSafeAreaInsets()
  const router = useRouter()

  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  useEffect(() => {
    // Slow zoom and pan effect
    scale.value = withRepeat(
      withTiming(1.15, {
        duration: 20_000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    )

    translateX.value = withRepeat(
      withTiming(20, {
        duration: 15_000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    )

    translateY.value = withRepeat(
      withTiming(-20, {
        duration: 18_000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    )
  }, [scale, translateX, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value }
    ]
  }))

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={require('../../assets/images/school6.jpg')}
          style={styles.backgroundImage}
        />
      </Animated.View>

      {/* Gradient Overlay */}
      <View style={styles.gradientOverlay} />

      {/* Content */}
      <View
        style={[
          styles.content,
          { paddingTop: top + 40, paddingBottom: bottom + 40 }
        ]}
      >
        <View style={styles.spacer} />

        <View style={styles.textContainer}>
          <Animated.Text
            entering={FadeIn.delay(800).duration(1000)}
            style={styles.title}
          >
            Your Campus
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(1200).duration(1000)}
            style={styles.title}
          >
            Life Unified
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(1600).duration(1000)}
            style={styles.subtitle}
          >
            Connect, collaborate, and grow with students worldwide
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(2000).springify()}
          style={styles.buttonContainer}
        >
          <Animated.Text
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          >
            Get Started
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  imageContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_HEIGHT * 1.2,
    left: -SCREEN_WIDTH * 0.1,
    top: -SCREEN_HEIGHT * 0.1
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  gradientOverlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.35)'
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  spacer: {
    flex: 1
  },
  textContainer: {
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center'
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    color: '#0C1824',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center'
  }
})
