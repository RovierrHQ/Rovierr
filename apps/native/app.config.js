module.exports = {
  expo: {
    name: 'rovierr',
    slug: 'rovierr',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'rovierr',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.rejoanahmed8.rovierr',
      CFBundleAllowMixedLocalizations: true,
      CFBundleLocalizations: ['en', 'zh-CN']
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './src/assets/images/android-icon-foreground.png',
        backgroundImage: './src/assets/images/android-icon-background.png',
        monochromeImage: './src/assets/images/android-icon-monochrome.png'
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.RECORD_AUDIO'],
      package: 'com.rejoanahmed8.rovierr'
    },
    web: {
      output: 'static',
      favicon: './src/assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000'
          }
        }
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'The app accesses your photos/videoes to let you share them with your friends.'
        }
      ],
      '@react-native-community/datetimepicker',
      [
        '@stripe/stripe-react-native',
        {
          publishableKey:
            'pk_test_51SivAXEPjiz03eXlv636sdH5mELNnvOvdDM9cn5pwV5DITuDCMCY1QROmuesWe9eQrRJxr1CQJBTIu5lexJlzPxl00xzzmsROE',
          merchantIdentifier: ''
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      eas: {
        projectId: '11266da4-1440-4e83-96ee-8b0639ca9f08'
      }
    }
  }
}
