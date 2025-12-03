import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { orpc } from '@/utils/orpc'

/**
 * Auto-save hook with debouncing
 * Automatically saves data after a delay when it changes
 */
export function useAutoSave<T>(
  data: T,
  onSave: (d: T) => Promise<void>,
  delay = 2000
) {
  const [isSaving, setIsSaving] = useState(false)
  const initialDataRef = useRef(data)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Don't save if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(initialDataRef.current)) {
      return
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await onSave(data)
        initialDataRef.current = data
      } catch (_error) {
        //
      } finally {
        setIsSaving(false)
      }
    }, delay)

    // Cleanup timeout on unmount or data change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave, delay])

  return { isSaving }
}

/**
 * Hook to fetch resume data
 * Wraps the ORPC query with proper typing
 */
export function useResumeData(resumeId: string) {
  return useQuery(orpc.resume.get.queryOptions({ input: { id: resumeId } }))
}

/**
 * Hook to fetch resume list
 * Wraps the ORPC query for listing resumes
 */
export function useResumeList(limit = 50, offset = 0) {
  return useQuery(
    orpc.resume.list.queryOptions({
      input: {
        limit,
        offset
      }
    })
  )
}
