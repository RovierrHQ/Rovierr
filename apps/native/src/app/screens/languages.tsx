import AnimatedView from '@rov/components/AnimatedView'
import Header from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import Section from '@rov/components/layout/Section'
import ThemedText from '@rov/components/ThemedText'
import ThemedScroller from '@rov/components/ThemeScroller'
import { DE, ES, FR, IT, PT, SA, TR, US } from 'country-flag-icons/string/3x2'
import { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

type Language = {
  title: string
  code: string
  flag: string
}

export default function LanguagesScreen() {
  const languages: Language[] = [
    { title: 'English', code: 'EN', flag: US },
    { title: 'Spanish', code: 'ES', flag: ES },
    { title: 'Portuguese', code: 'PT', flag: PT },
    { title: 'French', code: 'FR', flag: FR },
    { title: 'German', code: 'DE', flag: DE },
    { title: 'Italian', code: 'IT', flag: IT },
    { title: 'Arabic', code: 'AR', flag: SA },
    { title: 'Turkish', code: 'TR', flag: TR }
  ]

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  return (
    <>
      <Header showBackButton />
      <ThemedScroller className="p-global">
        <Section
          className="mt-4 mb-10"
          title="Choose Language"
          titleSize="4xl"
        />
        {languages.map((language, index) => (
          <LanguageItem
            code={language.code}
            flag={language.flag}
            key={index}
            onSelect={() => {
              setSelectedLanguage(language.title)
            }}
            selected={selectedLanguage === language.title}
            title={language.title}
          />
        ))}
      </ThemedScroller>
    </>
  )
}

type LanguageItemProps = {
  title: string
  code: string
  flag: string
  selected: boolean
  onSelect: () => void
}

const LanguageItem = ({
  title,
  code,
  flag,
  selected,
  onSelect
}: LanguageItemProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`flex-row items-center py-6 border-b border-border ${selected ? 'opacity-100' : 'opacity-100 '}`}
      onPress={onSelect}
    >
      <View className="w-7 h-7 mr-6 rounded overflow-hidden">
        <SvgXml height={28} width={28} xml={flag} />
      </View>
      <View className="flex-1">
        <ThemedText className="text-lg font-bold">{title}</ThemedText>
        <ThemedText className="text-sm opacity-60">{code}</ThemedText>
      </View>
      {selected && (
        <AnimatedView animation="bounceIn" duration={500}>
          <Icon name="Check" size={25} />
        </AnimatedView>
      )}
    </TouchableOpacity>
  )
}
