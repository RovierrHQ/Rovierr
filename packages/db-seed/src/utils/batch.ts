/**
 * Batch insert utility for efficient database operations
 */

/**
 * Split an array into chunks of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Default batch size for inserts
 */
export const DEFAULT_BATCH_SIZE = 1000
