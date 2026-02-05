import { useRouter } from 'expo-router'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TILE_SIZE = SCREEN_WIDTH / 2

const images = [
  require('../../assets/images/school1.jpg'),
  require('../../assets/images/school2.jpg'),
  require('../../assets/images/school3.jpg'),
  require('../../assets/images/school5.jpg')
]

export default function TiledBackground() {
  const { top, bottom } = useSafeAreaInsets()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <View style={styles.container}>
      {/* Tiled Background Grid */}
      <View style={styles.grid}>
        {images.map((image, index) => (
          <Animated.View
            entering={FadeIn.delay(index * 150).duration(800)}
            key={index}
            style={styles.tile}
          >
            <Image blurRadius={2} source={image} style={styles.tileImage} />
            <View style={styles.tileOverlay} />
          </Animated.View>
        ))}
      </View>

      {/* Center Content Card */}
      <View
        style={[
          styles.content,
          { paddingTop: top + 40, paddingBottom: bottom + 40 }
        ]}
      >
        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          style={styles.card}
        >
          <Animated.View entering={FadeIn.delay(1200).duration(800)}>
            <Animated.Text style={styles.title}>Your Campus</Animated.Text>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(1400).duration(800)}>
            <Animated.Text style={styles.title}>Life Unified</Animated.Text>
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(1600).duration(800)}
            style={styles.divider}
          />

          <Animated.View entering={FadeIn.delay(1800).duration(800)}>
            <Animated.Text style={styles.subtitle}>
              Connect with students worldwide. Collaborate beyond boundaries.
            </Animated.Text>
          </Animated.View>

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
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7'
  },
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    overflow: 'hidden'
  },
  tileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  tileOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)'
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    color: '#0C1824',
    textAlign: 'center',
    lineHeight: 50
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#0C1824',
    borderRadius: 2,
    marginVertical: 20
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  buttonContainer: {
    marginTop: 28,
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
