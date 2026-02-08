import { useThemeColors } from '@rov/contexts/ThemeColors'
import { router } from 'expo-router'
import type React from 'react'
import { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import type { ActionSheetRef } from 'react-native-actions-sheet'
import ActionSheetThemed from './ActionSheetThemed'
import { Button } from './Button'
import Icon from './Icon'
import ThemedText from './ThemedText'

type FavoriteProps = {
  initialState?: boolean
  size?: number
  className?: string
  productName?: string
  isWhite?: boolean
  onToggle?: (isFavorite: boolean) => void
}

const Favorite: React.FC<FavoriteProps> = ({
  initialState = false,
  size = 24,
  className = '',
  productName = 'Product',
  onToggle,
  isWhite = false
}) => {
  const [isFavorite, setIsFavorite] = useState(initialState)
  const actionSheetRef = useRef<ActionSheetRef>(null)
  const colors = useThemeColors()

  const handleToggle = () => {
    const newState = !isFavorite
    setIsFavorite(newState)
    actionSheetRef.current?.show()

    if (onToggle) {
      onToggle(newState)
    }
  }

  const handleViewFavorites = () => {
    actionSheetRef.current?.hide()
    // Navigate to favorites screen
    router.push('/(drawer)/(tabs)/favorites')
  }

  return (
    <>
      <Pressable className={className} onPress={handleToggle}>
        {isWhite ? (
          <Icon
            color={isFavorite ? 'white' : 'white'}
            fill={isFavorite ? 'white' : 'none'}
            name="Bookmark"
            size={size}
            strokeWidth={1.8}
          />
        ) : (
          <Icon
            color={isFavorite ? colors.highlight : colors.icon}
            fill={isFavorite ? colors.highlight : 'none'}
            name="Bookmark"
            size={size}
            strokeWidth={1.8}
          />
        )}
      </Pressable>

      <ActionSheetThemed
        gestureEnabled
        id={`favorite-sheet-${productName}`}
        ref={actionSheetRef}
      >
        <View className="p-4 pb-6">
          <ThemedText className="text-lg font-bold mt-4 mb-1 text-left">
            {isFavorite ? 'Added to Bookmarks' : 'Removed from Bookmarks'}
          </ThemedText>

          <ThemedText className="text-left mb-6">
            {isFavorite
              ? `${productName} has been added to your bookmarks.`
              : `${productName} has been removed from your bookmarks.`}
          </ThemedText>

          <View className="flex-row w-full justify-center">
            {isFavorite && (
              <Button
                className="flex-1"
                onPress={handleViewFavorites}
                title="View Bookmarks"
              />
            )}

            <Button
              className={isFavorite ? 'ml-3 px-6' : 'px-6'}
              onPress={() => actionSheetRef.current?.hide()}
              title="Continue Browsing"
              variant="outline"
            />
          </View>
        </View>
      </ActionSheetThemed>
    </>
  )
}

export default Favorite
