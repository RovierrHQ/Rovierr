import type { UseQueryResult } from '@tanstack/react-query'

export const apiStatus = (res: UseQueryResult<string, Error>) => {
  if (res.isLoading) return 'Checking...'
  return res.data ? 'Connected' : 'Disconnected'
}

export * from './form-types'
export * from './quiz'
export * from './smart-field-registry'
