import api, { useQuery } from '@web/lib/api-client'
import { useEffect, useRef, useState } from 'react'

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
  return useQuery(['resume', 'get', resumeId], () =>
    api.resume.get({ query: { id: resumeId } })
  )
}

/**
 * Hook to fetch resume list
 * Wraps the ORPC query for listing resumes
 */
export function useResumeList(limit = 50, offset = 0) {
  return useQuery(['resume', 'list', limit.toString(), offset.toString()], () =>
    api.resume.list.get({
      query: {
        limit: limit.toString(),
        offset: offset.toString()
      }
    })
  )
}
