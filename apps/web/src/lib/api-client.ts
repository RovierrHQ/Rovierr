import { type Treaty, treaty } from '@elysiajs/eden'
import {
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation as useTanstackMutation,
  useQuery as useTanstackQuery,
  useQueryClient as useTanstackQueryClient
} from '@tanstack/react-query'
import type { AppType } from 'api'

export function useQueryClient() {
  return useTanstackQueryClient()
}

const api = treaty<AppType>(
  import.meta.env.VITE_API_URL || 'http://localhost:3001',
  {
    fetch: {
      credentials: 'include',
      mode: 'cors'
    }
  }
)

/**
 * Typed useQuery hook for Eden Treaty endpoints
 * Automatically infers data and error types from the Treaty response
 * Usage: const { data, error } = useQuery({ queryKey: ['user', 'profile'], queryFn: () => api.user.profile.get() })
 */
export function useQuery<
  T extends Record<number, unknown> = Record<number, unknown>
>(
  options: {
    queryKey: QueryKey
    queryFn: () => Promise<Treaty.TreatyResponse<T>>
  } & Omit<
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
    ...options,
    queryFn: async () => {
      const response = await options.queryFn()

      if (response.error) {
        throw response.error
      }

      if (response.data !== undefined) {
        return response.data as Treaty.Data<Treaty.TreatyResponse<T>>
      }

      throw new Error('No data returned from API')
    }
  })
}

/**
 * Typed useMutation hook for Eden Treaty endpoints
 * Automatically infers data, error, and variables types from the Treaty response
 * Usage: const mutation = useMutation((data) => api.user.profile.patch(data))
 */
export function useMutation<
  TVariables = void,
  T extends Record<number, unknown> = Record<number, unknown>,
  TContext = unknown
>(
  treatyFn: (variables: TVariables) => Promise<Treaty.TreatyResponse<T>>,
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>,
      TVariables,
      TContext
    >,
    'mutationFn'
  >
) {
  return useTanstackMutation<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>,
    TVariables,
    TContext
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
