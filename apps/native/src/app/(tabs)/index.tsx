import ParallaxScrollView from '@native/components/parallax-scroll-view'
import { ThemedText } from '@native/components/themed-text'
import { ThemedView } from '@native/components/themed-view'
import { authClient } from '@native/lib/auth-client'
import { useTranslation } from '@rov/localization'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Alert, StyleSheet, TouchableOpacity } from 'react-native'

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const { data: session } = authClient.useSession()
  const router = useRouter()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh-CN' : 'en'
    i18n.changeLanguage(newLang)
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authClient.signOut()
          } catch (error) {
            console.error('[Auth Error] Sign-out failed:', error)
            // Still navigate to welcome even if server sign-out fails
            Alert.alert(
              'Sign Out Error',
              'There was an error signing out, but your local session has been cleared.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/welcome')
                }
              ]
            )
          }
        }
      }
    ])
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@native/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('profile', 'Profile')}</ThemedText>
      </ThemedView>

      {session && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Account</ThemedText>
          <ThemedText>{session.user.email}</ThemedText>
          <ThemedText>{session.user.name}</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.stepContainer}>
        <ThemedText>{t('welcome')}</ThemedText>
        <TouchableOpacity onPress={toggleLanguage} style={styles.button}>
          <ThemedText style={styles.buttonText}>
            Switch to {i18n.language === 'en' ? 'Chinese' : 'English'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.button, styles.signOutButton]}
        >
          <ThemedText style={[styles.buttonText, styles.signOutButtonText]}>
            Sign Out
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
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  signOutButton: {
    backgroundColor: '#dc2626'
  },
  signOutButtonText: {
    color: 'white'
  }
})
