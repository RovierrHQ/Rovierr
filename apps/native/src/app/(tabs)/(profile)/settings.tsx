import { Icon } from '@native/components/ui/icon'
import { useColorScheme } from '@native/lib/use-color-scheme'
import { useTranslation } from '@rov/localization'
import { router, Stack } from 'expo-router'
import { setItemAsync } from 'expo-secure-store'
import { Pressable, ScrollView, Switch, Text, View } from 'react-native'

export default function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const { colorScheme, setColorScheme } = useColorScheme()

  const toggleTheme = (value: boolean) => {
    setColorScheme(value ? 'dark' : 'light')
  }

  const changeLanguage = async (lang: string) => {
    i18n.changeLanguage(lang)
    await setItemAsync('user-language', lang)
  }

  return (
    <>
      <Stack.Screen options={{ title: t('settings', 'Settings') }} />
      <ScrollView className="flex-1 bg-zinc-50 dark:bg-black p-4">
        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-zinc-500 mb-2 uppercase ml-3">
            {t('appearance', 'Appearance')}
          </Text>
          <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden px-4">
            <View className="flex-row items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center mr-3">
                  <Icon color="#7c3aed" name="moon.fill" size={18} />
                </View>
                <Text className="text-base font-medium text-zinc-900 dark:text-white">
                  {t('darkMode', 'Dark Mode')}
                </Text>
              </View>
              <Switch
                onValueChange={toggleTheme}
                thumbColor={'#ffffff'}
                trackColor={{ false: '#e4e4e7', true: '#7c3aed' }}
                value={colorScheme === 'dark'}
              />
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-zinc-500 mb-2 uppercase ml-3">
            {t('language', 'Language')}
          </Text>
          <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <Pressable
              className="flex-row items-center justify-between py-4 px-4 border-b border-zinc-100 dark:border-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-800"
              onPress={() => changeLanguage('en')}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🇺🇸</Text>
                <Text className="text-base font-medium text-zinc-900 dark:text-white">
                  English
                </Text>
              </View>
              {i18n.language === 'en' && (
                <Icon color="#7c3aed" name="checkmark" size={20} />
              )}
            </Pressable>

            <Pressable
              className="flex-row items-center justify-between py-4 px-4 active:bg-zinc-100 dark:active:bg-zinc-800"
              onPress={() => changeLanguage('zh-CN')}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🇨🇳</Text>
                <Text className="text-base font-medium text-zinc-900 dark:text-white">
                  中文 (Chinese)
                </Text>
              </View>
              {i18n.language.startsWith('zh') && (
                <Icon color="#7c3aed" name="checkmark" size={20} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Subscription Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-zinc-500 mb-2 uppercase ml-3">
            Subscription
          </Text>
          <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <Pressable
              className="flex-row items-center justify-between py-4 px-4 active:bg-zinc-100 dark:active:bg-zinc-800"
              onPress={() => router.push('/(tabs)/(profile)/pricing')}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center mr-3">
                  <Icon color="#7c3aed" name="creditcard.fill" size={18} />
                </View>
                <Text className="text-base font-medium text-zinc-900 dark:text-white">
                  Pricing & Plans
                </Text>
              </View>
              <Icon color="#9ca3af" name="chevron.right" size={20} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  )
}
