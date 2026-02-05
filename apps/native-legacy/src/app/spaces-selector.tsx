import { currentSpaceAtom } from '@native/store/space'
import { useTranslation } from '@rov/localization'
import { useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function SpacesSelector() {
  const router = useRouter()
  const { t } = useTranslation()
  const [, setCurrentSpaceId] = useAtom(currentSpaceAtom)

  const spaces = [
    // { id: 'academics', name: t('common:academics', 'Academics') },
    { id: 'personal', name: t('common:personal', 'Personal') },
    { id: 'societies', name: t('common:societies', 'Societies') }
    // { id: 'career', name: t('common:career', 'Career') }
  ] as const

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common:spaces', 'Switch Space')}</Text>
      {spaces.map((space) => (
        <TouchableOpacity
          key={space.id}
          onPress={() => {
            setCurrentSpaceId(space.id)
            router.dismiss()
            router.replace(`/(tabs)/spaces/${space.id}`)
          }}
          style={styles.item}
        >
          <Text style={styles.itemText}>{space.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemText: {
    fontSize: 18
  }
})
