import { useRouter } from 'expo-router'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function SplitScreenHarmony() {
  const { top, bottom } = useSafeAreaInsets()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <View style={styles.container}>
      {/* Top Half - Rooftop Garden */}
      <Animated.View
        entering={FadeIn.duration(1000)}
        style={[styles.halfScreen, styles.topHalf]}
      >
        <Image
          source={require('../../assets/images/school6.jpg')}
          style={styles.image}
        />
        <View style={styles.overlay} />
      </Animated.View>

      {/* Bottom Half - Bridge */}
      <Animated.View
        entering={FadeIn.delay(200).duration(1000)}
        style={[styles.halfScreen, styles.bottomHalf]}
      >
        <Image
          source={require('../../assets/images/school4.jpg')}
          style={styles.image}
        />
        <View style={styles.overlay} />
      </Animated.View>

      {/* Center Content Card */}
      <View
        style={[
          styles.centerContent,
          { paddingTop: top + 20, paddingBottom: bottom + 20 }
        ]}
      >
        <Animated.View
          entering={FadeIn.delay(800).duration(1000)}
          style={styles.card}
        >
          <Animated.Text
            entering={FadeIn.delay(1200).duration(800)}
            style={styles.title}
          >
            Your Campus
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(1400).duration(800)}
            style={styles.title}
          >
            Life Unified
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(1600).duration(800)}
            style={styles.subtitle}
          >
            A global network for students across all universities
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(1800).springify()}
            style={styles.buttonContainer}
          >
            <Animated.Text
              onPress={handleGetStarted}
              style={styles.getStartedButton}
            >
              Get Started
            </Animated.Text>
          </Animated.View>
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
  halfScreen: {
    height: SCREEN_HEIGHT / 2,
    width: '100%',
    overflow: 'hidden'
  },
  topHalf: {
    position: 'absolute',
    top: 0
  },
  bottomHalf: {
    position: 'absolute',
    bottom: 0
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)'
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
    maxWidth: 400
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#0C1824',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%'
  },
  getStartedButton: {
    backgroundColor: '#0C1824',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center'
  }
})
