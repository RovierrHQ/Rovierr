import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native'
import Animated, {
  FadeIn,
  LinearTransition,
  SlideInLeft,
  SlideInRight
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const gap = 10

type HeadTextProps = {
  text?: string
  side?: 'left' | 'right'
  image?: ImageSourcePropType
}

const HeadText = (props: HeadTextProps) => {
  const { text, side, image } = props
  const [totalWidth, setTotalWidth] = useState(0)
  const [textWidth, setTextWidth] = useState(0)
  const width = totalWidth - textWidth - gap

  const Transition = LinearTransition.delay(1650)
    .springify()
    .damping(18)
    .stiffness(50)
  const LeftSlide = SlideInLeft.delay(1500)
    .springify()
    .damping(18)
    .stiffness(50)
  const RightSlide = SlideInRight.delay(1500)
    .springify()
    .damping(18)
    .stiffness(50)

  return (
    <Animated.View
      entering={FadeIn.delay(1000).springify().damping(18).stiffness(50)}
      layout={Transition}
      onLayout={(event) => {
        setTotalWidth(event.nativeEvent.layout.width)
      }}
      style={styles.headerContainer}
    >
      {Boolean(width > 0) && side === 'left' && (
        <Animated.View
          entering={LeftSlide}
          style={[styles.embedImage, { width }]}
        >
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
      {Boolean(text) && (
        <Animated.Text
          layout={Transition}
          onLayout={(event) => {
            setTextWidth(event.nativeEvent.layout.width)
          }}
          style={styles.headText}
        >
          {text}
        </Animated.Text>
      )}
      {Boolean(width > 0) && side === 'right' && (
        <Animated.View
          entering={RightSlide}
          style={[styles.embedImage, { width }]}
        >
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
    </Animated.View>
  )
}

export default function WelcomeScreen() {
  const { top, bottom } = useSafeAreaInsets()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
      <View style={{ gap }}>
        <HeadText
          image={require('../assets/images/icon.png')}
          side="right"
          text="Your"
        />
        <HeadText
          image={require('../assets/images/react-logo.png')}
          side="right"
          text="All-In-One"
        />
        <HeadText
          image={require('../assets/images/partial-react-logo.png')}
          side="left"
          text="Creative"
        />
        <HeadText text="Powerhouse" />
        <HeadText
          image={require('../assets/images/splash-icon.png')}
          side="right"
        />
      </View>

      <Animated.View
        entering={FadeIn.delay(2000).springify().damping(18).stiffness(50)}
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center'
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    justifyContent: 'center',
    gap,
    height: 80
  },
  embedImage: {
    height: 80,
    borderRadius: 22,
    overflow: 'hidden'
  },
  headText: {
    fontSize: 70,
    fontWeight: '700',
    color: '#0C1824'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  buttonContainer: {
    marginTop: 40,
    alignItems: 'center'
  },
  getStartedButton: {
    backgroundColor: '#0C1824',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden'
  }
})
