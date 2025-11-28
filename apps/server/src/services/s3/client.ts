import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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
  folder: 'profile-pictures' | 'banners' | 'id-cards',
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
      ContentType: `image/${mimeType}`
    })

    await s3Client.send(command)

    logger.info({ key, folder, userId }, 'Image uploaded to S3 successfully')

    // Store the S3 key URL in database (we'll generate presigned URLs on-demand)
    // The key URL format: https://bucket.s3.region.amazonaws.com/key
    const keyUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

    return keyUrl
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

/**
 * Generate a presigned URL for an S3 object
 * @param key - S3 object key (e.g., 'profile-pictures/user-id-timestamp.jpg')
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL that allows temporary access to the object
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    logger.error({ error, key }, 'Failed to generate presigned URL')
    throw new Error('Failed to generate presigned URL')
  }
}

/**
 * Generate presigned URL from full S3 URL
 * @param imageUrl - Full S3 URL (e.g., 'https://bucket.s3.region.amazonaws.com/key')
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL
 */
export async function getPresignedUrlFromFullUrl(
  imageUrl: string,
  expiresIn = 3600
): Promise<string> {
  const match = imageUrl.match(S3_URL_PATTERN)
  if (!match) {
    throw new Error('Invalid S3 URL format')
  }
  const key = match[1]
  return await getPresignedUrl(key, expiresIn)
}

/**
 * Check if a URL is an S3 URL
 */
export function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('s3') && url.includes('amazonaws.com')
}
