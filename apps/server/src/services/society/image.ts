/**
 * Image service for society logo and banner uploads
 * Handles validation, upload to cloud storage, and cleanup
 */

import { deleteImageFromS3, isS3Url, uploadImageToS3 } from '../s3'
import {
  BANNER_CONSTRAINTS,
  type ImageConstraints,
  LOGO_CONSTRAINTS,
  type ValidationResult,
  validateImage
} from './validation'

export type ImageType = 'logo' | 'banner'

export class ImageService {
  /**
   * Upload image to cloud storage
   * @param file - File object or base64 string
   * @param type - Image type (logo or banner)
   * @param societyId - Society ID for folder organization
   * @returns URL of uploaded image
   */
  async upload(
    base64Image: string,
    type: ImageType,
    societyId: string
  ): Promise<string> {
    // Determine folder based on type
    const folder = type === 'logo' ? 'profile-pictures' : 'banners'

    // Upload to S3
    const url = await uploadImageToS3(base64Image, folder, societyId)

    return url
  }

  /**
   * Delete image from cloud storage
   * @param url - Image URL to delete
   */
  async delete(url: string): Promise<void> {
    if (!isS3Url(url)) {
      throw new Error('Invalid S3 URL')
    }

    await deleteImageFromS3(url)
  }

  /**
   * Validate image file against constraints
   * @param file - File to validate
   * @param type - Image type (logo or banner)
   * @returns Validation result
   */
  validate(file: File, type: ImageType): ValidationResult {
    const constraints = type === 'logo' ? LOGO_CONSTRAINTS : BANNER_CONSTRAINTS
    return validateImage(file, constraints)
  }

  /**
   * Get constraints for image type
   * @param type - Image type
   * @returns Image constraints
   */
  getConstraints(type: ImageType): ImageConstraints {
    return type === 'logo' ? LOGO_CONSTRAINTS : BANNER_CONSTRAINTS
  }

  /**
   * Optimize image (placeholder for future implementation)
   * This would handle:
   * - Resizing to optimal dimensions
   * - Converting to WebP format
   * - Compressing file size
   * @param file - File to optimize
   * @returns Optimized file
   */
  optimize(file: File): File {
    // TODO: Implement image optimization
    // For now, return the original file
    return file
  }
}

// Export singleton instance
export const imageService = new ImageService()
