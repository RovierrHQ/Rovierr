import { useTranslation } from '@rov/localization'
import { Image } from 'expo-image'
import { StyleSheet, TouchableOpacity } from 'react-native'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh-CN' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('profile', 'Profile')}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText>{t('welcome')}</ThemedText>
        <TouchableOpacity
          onPress={toggleLanguage}
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: '#0a7ea4',
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
            Switch to {i18n.language === 'en' ? 'Chinese' : 'English'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute'
  }
})
