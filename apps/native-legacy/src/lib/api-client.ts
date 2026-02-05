import type { App } from '@api/index'
import { type Treaty, treaty } from '@elysiajs/eden'
import {
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation as useTanstackMutation,
  useQuery as useTanstackQuery
} from '@tanstack/react-query'
import { authClient } from './auth-client'

const headers = () => {
  const headers = new Map<string, string>()
  const cookies = authClient.getCookie()
  if (cookies) {
    headers.set('Cookie', cookies)
  }
  return Object.fromEntries(headers)
}
const api = treaty<App>(process.env.EXPO_PUBLIC_SERVER_URL || '', {
  fetch: {
    credentials: 'include',
    mode: 'cors'
  },
  headers: headers()
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

/**
 * Typed useMutation hook for Eden Treaty endpoints
 * Automatically infers data, error, and variables types from the Treaty response
 * Usage: const mutation = useMutation((data) => api.user.profile.patch(data))
 */
export function useMutation<
  TVariables = void,
  T extends Record<number, unknown> = Record<number, unknown>
>(
  treatyFn: (variables: TVariables) => Promise<Treaty.TreatyResponse<T>>,
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>,
      TVariables
    >,
    'mutationFn'
  >
) {
  return useTanstackMutation<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>,
    TVariables
  >({
    mutationFn: async (variables: TVariables) => {
      const response = await treatyFn(variables)

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
