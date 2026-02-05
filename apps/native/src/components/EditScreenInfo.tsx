import { Link } from 'expo-router'
import { View } from 'react-native'

export const EditScreenInfo = ({ path }: { path: string }) => {
  const _title = 'Open up the code for this screen:'
  const _description =
    'Change any of the text, save the file, and your app will automatically update.'

  return (
    <View>
      <Link className="text-4xl font-semibold" href="/screens/home">
        Home
      </Link>
    </View>
  )
}

const _styles = {
  codeHighlightContainer: 'rounded-md px-1',
  getStartedContainer: 'items-center mx-12',
  getStartedText: 'text-lg leading-6 text-center',
  helpContainer: 'items-center mx-5 mt-4',
  helpLink: 'py-4',
  helpLinkText: 'text-center',
  homeScreenFilename: 'my-2'
}
