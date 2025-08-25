import type { UseQueryResult } from '@tanstack/react-query'

export const apiStatus = (res: UseQueryResult<string, Error>) => {
  if (res.isLoading) return 'Checking...'
  return res.data ? 'Connected' : 'Disconnected'
}

export * from './quiz'
