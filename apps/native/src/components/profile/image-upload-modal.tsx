import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import {
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../ui/icon'

type ImageUploadModalProps = {
  visible: boolean
  type: 'profile' | 'banner'
  currentImageUrl: string | null
  onClose: () => void
  onSave: (imageData: string) => Promise<void>
}

export function ImageUploadModal({
  visible,
  type,
  currentImageUrl,
  onClose,
  onSave
}: ImageUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)

  // Image compression and optimization
  const compressImage = async (uri: string): Promise<string> => {
    try {
      // Get image dimensions for aspect ratio calculation
      const imageInfo = await ImageManipulator.manipulateAsync(uri, [], {
        format: ImageManipulator.SaveFormat.JPEG
      })

      // Calculate target dimensions (max 2MB, reasonable resolution)
      const maxWidth = type === 'banner' ? 1200 : 800
      const maxHeight = type === 'banner' ? 400 : 800

      let { width, height } = imageInfo

      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width
        const heightRatio = maxHeight / height
        const ratio = Math.min(widthRatio, heightRatio)

        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // Compress and resize image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width, height } }],
        {
          compress: 0.8, // 80% quality
          format: ImageManipulator.SaveFormat.JPEG
        }
      )

      return compressedImage.uri
    } catch (error) {
      console.error('Image compression failed:', error)
      throw new Error('Failed to compress image')
    }
  }

  const processAndUploadImage = async (uri: string) => {
    try {
      setIsUploading(true)

      // Compress the image
      const compressedUri = await compressImage(uri)

      // Convert to base64 for upload
      const response = await fetch(compressedUri)
      const blob = await response.blob()

      // Convert blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(blob)

      reader.onload = async () => {
        try {
          const base64Data = reader.result as string
          await onSave(base64Data)
          onClose()
        } catch (uploadError) {
          console.error('Upload failed:', uploadError)
          Alert.alert('Error', 'Failed to upload image')
        } finally {
          setIsUploading(false)
        }
      }

      reader.onerror = () => {
        console.error('Failed to read image file')
        Alert.alert('Error', 'Failed to process image')
        setIsUploading(false)
      }
    } catch (processError) {
      console.error('Image processing failed:', processError)
      Alert.alert('Error', 'Failed to process image')
      setIsUploading(false)
    }
  }

  const handleChooseFromGallery = async () => {
    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select images.',
          [{ text: 'OK' }]
        )
        return
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'banner' ? [3, 1] : [1, 1],
        quality: 1 // We'll compress it ourselves
      })

      if (!result.canceled && result.assets[0]) {
        await processAndUploadImage(result.assets[0].uri)
      }
    } catch (galleryError) {
      console.error('Gallery selection failed:', galleryError)
      Alert.alert('Error', 'Failed to select image from gallery')
    }
  }

  const handleTakePhoto = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos.',
          [{ text: 'OK' }]
        )
        return
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'banner' ? [3, 1] : [1, 1],
        quality: 1 // We'll compress it ourselves
      })

      if (!result.canceled && result.assets[0]) {
        await processAndUploadImage(result.assets[0].uri)
      }
    } catch (cameraError) {
      console.error('Camera capture failed:', cameraError)
      Alert.alert('Error', 'Failed to take photo')
    }
  }

  const handleRemoveImage = () => {
    if (!currentImageUrl) return

    Alert.alert(
      'Remove Image',
      `Are you sure you want to remove your ${type} image?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUploading(true)
              await onSave('') // Empty string to remove image
              onClose()
            } catch (removeError) {
              console.error('Remove image failed:', removeError)
              Alert.alert('Error', 'Failed to remove image')
            } finally {
              setIsUploading(false)
            }
          }
        }
      ]
    )
  }

  const title =
    type === 'profile' ? 'Change Profile Picture' : 'Change Banner Image'

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      visible={visible}
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#E3E5E8] dark:border-[#374151]">
          <TouchableOpacity
            accessibilityLabel="Close"
            accessibilityRole="button"
            className="p-2"
            onPress={onClose}
          >
            <Icon
              color="#8E9297"
              name="xmark"
              size={24}
            />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-[#060607] dark:text-white">
            {title}
          </Text>

          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="flex-1 p-4">
          <View className="mb-6">
            {/* Choose from Gallery */}
            <TouchableOpacity
              accessibilityLabel="Choose from gallery"
              accessibilityRole="button"
              className="flex-row items-center bg-[#F2F3F5] dark:bg-[#1F2937] p-4 rounded-xl mb-3 border border-[#E3E5E8] dark:border-[#374151] min-h-[64px] shadow-sm"
              disabled={isUploading}
              onPress={handleChooseFromGallery}
            >
              <View className="w-10 h-10 rounded-full bg-white dark:bg-black justify-center items-center mr-3">
                <Icon color="#5865F2" name="photo.fill" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-[#060607] dark:text-white mb-0.5">
                  Choose from Gallery
                </Text>
                <Text className="text-sm text-[#8E9297]">
                  Select an image from your photo library
                </Text>
              </View>
              <Icon color="#8E9297" name="chevron.right" size={20} />
            </TouchableOpacity>

            {/* Take Photo */}
            <TouchableOpacity
              accessibilityLabel="Take photo"
              accessibilityRole="button"
              className="flex-row items-center bg-[#F2F3F5] dark:bg-[#1F2937] p-4 rounded-xl mb-3 border border-[#E3E5E8] dark:border-[#374151] min-h-[64px] shadow-sm"
              disabled={isUploading}
              onPress={handleTakePhoto}
            >
              <View className="w-10 h-10 rounded-full bg-white dark:bg-black justify-center items-center mr-3">
                <Icon color="#5865F2" name="camera.fill" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-[#060607] dark:text-white mb-0.5">
                  Take Photo
                </Text>
                <Text className="text-sm text-[#8E9297]">
                  Use your camera to take a new photo
                </Text>
              </View>
              <Icon color="#8E9297" name="chevron.right" size={20} />
            </TouchableOpacity>

            {/* Remove Image (only if current image exists) */}
            {currentImageUrl && (
              <TouchableOpacity
                accessibilityLabel="Remove image"
                accessibilityRole="button"
                className="flex-row items-center bg-[#FFF5F5] dark:bg-[#3F1111] border border-[#FED7D7] dark:border-[#7F1D1D] p-4 rounded-xl mb-3 min-h-[64px] shadow-sm"
                disabled={isUploading}
                onPress={handleRemoveImage}
              >
                <View className="w-10 h-10 rounded-full bg-white dark:bg-black justify-center items-center mr-3">
                  <Icon
                    color="#DC3545"
                    name="trash.fill"
                    size={24}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#DC3545] mb-0.5">
                    Remove Image
                  </Text>
                  <Text className="text-sm text-[#8E9297]">
                    Remove your current {type} image
                  </Text>
                </View>
                <Icon color="#8E9297" name="chevron.right" size={20} />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading State */}
          {isUploading && (
            <View className="items-center py-4">
              <Text className="text-sm text-[#8E9297]">
                Compressing and uploading image...
              </Text>
            </View>
          )}

          {/* Info */}
          <View className="bg-[#F2F3F5] dark:bg-[#1F2937] p-4 rounded-xl mt-auto">
            <Text className="text-sm text-[#8E9297] text-center leading-5 mb-2">
              {type === 'profile'
                ? 'Your profile picture will be visible to other students. Images are automatically compressed for optimal performance.'
                : 'Your banner image will be displayed at the top of your profile. Images are automatically compressed for optimal performance.'}
            </Text>
            <Text className="text-xs text-[#8E9297] text-center mb-0">
              • Maximum size: 2MB • Format: JPEG •{' '}
              {type === 'banner'
                ? 'Recommended ratio: 3:1'
                : 'Square aspect ratio recommended'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}
