import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
})

// Regex patterns for image processing
const BASE64_IMAGE_REGEX = /^data:image\/(\w+);base64,(.+)$/
const S3_URL_PATTERN = /https:\/\/[^/]+\/(.+)$/

/**
 * Upload image to S3 bucket
 * @param base64Image - Base64 encoded image data URL (data:image/...;base64,...)
 * @param folder - Folder path in bucket (e.g., 'profile-pictures', 'banners')
 * @param userId - User ID for unique file naming
 * @returns Public URL of uploaded image
 */
export async function uploadImageToS3(
  base64Image: string,
  folder: 'profile-pictures' | 'banners',
  userId: string
): Promise<string> {
  try {
    // Extract base64 data and mime type from data URL
    const match = base64Image.match(BASE64_IMAGE_REGEX)

    if (!match) {
      throw new Error('Invalid base64 image format')
    }

    const [, mimeType, base64Data] = match
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType
    const filename = `${userId}-${Date.now()}.${fileExtension}`
    const key = `${folder}/${filename}`

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: `image/${mimeType}`,
      ACL: 'public-read'
    })

    await s3Client.send(command)

    // Construct public URL
    const publicUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

    logger.info({ key, folder, userId }, 'Image uploaded to S3 successfully')

    return publicUrl
  } catch (error) {
    logger.error({ error, folder, userId }, 'Failed to upload image to S3')
    throw new Error('Failed to upload image')
  }
}

/**
 * Delete image from S3 bucket
 * @param imageUrl - Full S3 URL of the image to delete
 */
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Extract key from URL
    // Format: https://bucket-name.s3.region.amazonaws.com/folder/filename
    const match = imageUrl.match(S3_URL_PATTERN)

    if (!match) {
      logger.warn({ imageUrl }, 'Invalid S3 URL format for deletion')
      return
    }

    const key = match[1]

    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key
    })

    await s3Client.send(command)

    logger.info({ key }, 'Image deleted from S3 successfully')
  } catch (error) {
    logger.error({ error, imageUrl }, 'Failed to delete image from S3')
    // Don't throw - deletion failures shouldn't break the flow
  }
}
