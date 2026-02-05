import { Toaster } from '@rov/ui/components/sonner'
import appCss from '@rov/ui/globals.css?url'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouteContext
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import i18n, { setSSRLanguage } from '@web/lib/i18n'
import { getUserSession } from '@web/services/auth'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  language?: string
}>()({
  beforeLoad: async ({ context }) => {
    // Set language on server to match client
    await setSSRLanguage()
    let session: Awaited<ReturnType<typeof getUserSession>> = null
    try {
      session = await context.queryClient.ensureQueryData({
        queryKey: ['session'],
        queryFn: () => getUserSession()
      })
    } catch {
      // SSR fetch to auth API can fail (e.g. API not reachable from worker, or down).
      // Treat as unauthenticated so we don't throw and cause hydration mismatch.
    }
    return { session, language: i18n.language }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'Starter Template'
      },
      {
        name: 'description',
        content:
          'Bun monorepo starter with TanStack Router, Hono API, and Better Auth.'
      },
      {
        name: 'keywords',
        content: 'monorepo, bun, tanstack, hono, better auth, starter template'
      },
      {
        property: 'og:title',
        content: 'Starter Template'
      },
      {
        property: 'og:description',
        content:
          'Bun monorepo starter with TanStack Router, Hono API, and Better Auth.'
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:url',
        content: 'https://starter.rejoanahmed.com'
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: 'Starter Template'
      },
      {
        name: 'twitter:description',
        content:
          'Bun monorepo starter with TanStack Router, Hono API, and Better Auth.'
      }
    ],
    links: [
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png'
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'manifest',
        href: '/site.webmanifest'
      },
      {
        rel: 'stylesheet',
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const context = useRouteContext({ from: '__root__' })
  const language = context.language || i18n.language || 'en'
  const queryClient = context.queryClient

  return (
    <html lang={language}>
      {/** biome-ignore lint/style/noHeadElement: re */}
      <head>
        <HeadContent />
      </head>
      <body className="pb-16 lg:pb-0">
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>{children}</NuqsAdapter>
          <TanStackDevtools
            config={{
              position: 'bottom-right'
            }}
            plugins={[
              {
                name: 'Starter Template',
                render: <TanStackRouterDevtoolsPanel />
              }
            ]}
          />
          <Toaster />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
