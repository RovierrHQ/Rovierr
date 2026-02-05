import { MutationCache, QueryClient } from '@tanstack/react-query'
import {
  createRouter as createTanStackRouter,
  ErrorComponent
} from '@tanstack/react-router'
import { toast } from 'sonner'
import { routeTree } from './routeTree.gen'
import '@web/lib/i18n'
import { NotFoundComponent } from './components/not-found'

export function getRouter() {
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 0,
        refetchOnWindowFocus: false
      }
    },
    mutationCache: new MutationCache({
      onError: (error: unknown, _1, _2, mutation) => {
        if (mutation?.meta?.disableGlobalErrorHandling) return

        if (error instanceof Error) {
          // const zodError = parseZodError(error);
          // if (zodError) {
          //   toast.error(fromError(zodError, { maxIssuesInMessage: 2 }).message);
          //   return;
          // }

          toast.error(error.message)
        } else if (typeof error === 'string') {
          toast.error(error)
        } else if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error
        ) {
          toast.error((error as { message: string }).message)
        }
      }
    })
  })

  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: ErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
    context: { queryClient }
  })

  if (process.env.LOG_DEBUG) {
    router.subscribe('onBeforeLoad', console.log)
    router.subscribe('onBeforeNavigate', console.log)
    router.subscribe('onBeforeRouteMount', console.log)
    router.subscribe('onLoad', console.log)
    router.subscribe('onRendered', console.log)
    router.subscribe('onResolved', console.log)
  }

  return router
}

declare module '@tanstack/react-router' {
  // biome-ignore lint/style/useConsistentTypeDefinitions: module declaration
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
