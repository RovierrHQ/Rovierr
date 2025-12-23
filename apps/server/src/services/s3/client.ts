import { env } from '@api/lib/env'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
    secretAccessKey: env.CLOUDFLARE_SECRET_KEY
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
  folder: 'profile-pictures' | 'banners' | 'id-cards' | 'campus-feed',
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
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: `image/${mimeType}`
    })

    await s3Client.send(command)

    console.info({ key, folder, userId }, 'Image uploaded to S3 successfully')

    // Store the S3 key URL in database (we'll generate presigned URLs on-demand)
    // The key URL format: https://bucket.s3.region.amazonaws.com/key
    const keyUrl = `${env.CLOUDFLARE_R2_ENDPOINT}/${key}`

    return keyUrl
  } catch (error) {
    console.error({ error, folder, userId }, 'Failed to upload image to S3')
    throw new Error('Failed to upload image')
  }
}

/**
 * Delete image from R2 bucket
 * @param imageUrl - Full R2 URL of the image to delete
 */
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Skip deletion if it's an old AWS S3 URL (we can't delete from AWS with R2 credentials)
    if (imageUrl.includes('amazonaws.com')) {
      console.warn(
        { imageUrl },
        'Skipping deletion of old AWS S3 image - migration in progress'
      )
      return
    }

    // Extract key from URL
    // Format: https://endpoint/folder/filename
    const match = imageUrl.match(S3_URL_PATTERN)

    if (!match) {
      console.warn({ imageUrl }, 'Invalid R2 URL format for deletion')
      return
    }

    const key = match[1]

    const command = new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: key
    })

    await s3Client.send(command)

    console.info({ key }, 'Image deleted from R2 successfully')
  } catch (error) {
    console.error({ error, imageUrl }, 'Failed to delete image from R2')
    // Don't throw - deletion failures shouldn't break the flow
  }
}

/**
 * Generate a presigned URL for an R2 object
 * @param key - R2 object key (e.g., 'profile-pictures/user-id-timestamp.jpg')
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL that allows temporary access to the object
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: key
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error({ error, key }, 'Failed to generate presigned URL')
    throw new Error('Failed to generate presigned URL')
  }
}

/**
 * Generate presigned URL from full R2 URL
 * @param imageUrl - Full R2 URL (e.g., 'https://endpoint/key')
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL
 */
export async function getPresignedUrlFromFullUrl(
  imageUrl: string,
  expiresIn = 3600
): Promise<string> {
  const match = imageUrl.match(S3_URL_PATTERN)
  if (!match) {
    throw new Error('Invalid R2 URL format')
  }
  const key = match[1]
  return await getPresignedUrl(key, expiresIn)
}

/**
 * Check if a URL is an S3/R2 URL
 */
export function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false
  // Check for both AWS S3 and Cloudflare R2 URLs
  return (
    (url.includes('s3') && url.includes('amazonaws.com')) ||
    url.includes(env.CLOUDFLARE_R2_ENDPOINT)
  )
}
