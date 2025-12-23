import type { App } from '@api/index'
import { type Treaty, treaty } from '@elysiajs/eden'
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery as useTanstackQuery
} from '@tanstack/react-query'

const api = treaty<App>(process.env.NEXT_PUBLIC_SERVER_URL || '', {
  fetch: {
    credentials: 'include',
    mode: 'cors'
  }
})

/**
 * Typed useQuery hook for Eden Treaty endpoints
 * Automatically infers data and error types from the Treaty response
 * Usage: const { data, error } = useQuery(['user', 'profile'], () => api.user.profile.get())
 */
export function useQuery<
  T extends Record<number, unknown> = Record<number, unknown>
>(
  queryKey: QueryKey,
  treatyFn: () => Promise<Treaty.TreatyResponse<T>>,
  options?: Omit<
    UseQueryOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useTanstackQuery<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>
  >({
    queryKey,
    queryFn: async () => {
      const response = await treatyFn()

      if (response.error) {
        throw response.error
      }

      if (response.data !== undefined) {
        return response.data as Treaty.Data<Treaty.TreatyResponse<T>>
      }

      throw new Error('No data returned from API')
    },
    ...options
  })
}

export default api
