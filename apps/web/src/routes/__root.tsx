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
import { CommandMenu } from '@web/components/command-menu'
import { ThemeProvider } from '@web/components/providers/theme-provider'
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
        title: 'Rovierr - Global Student Ecosystem'
      },
      {
        name: 'description',
        content:
          'Rovierr unifies essential tools into a single platform—designed for students, driven by simplicity, and built to scale with you.'
      },
      {
        name: 'keywords',
        content: 'student, university, education, campus, societies, clubs'
      },
      {
        property: 'og:title',
        content: 'Rovierr - Global Student Ecosystem'
      },
      {
        property: 'og:description',
        content:
          'Rovierr unifies essential tools into a single platform—designed for students, driven by simplicity, and built to scale with you.'
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: 'Rovierr - Global Student Ecosystem'
      },
      {
        name: 'twitter:description',
        content:
          'Rovierr unifies essential tools into a single platform—designed for students, driven by simplicity, and built to scale with you.'
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
    <html lang={language} suppressHydrationWarning>
      {/** biome-ignore lint/style/noHeadElement: re */}
      <head>
        <HeadContent />
      </head>
      <body className="pb-16 lg:pb-0 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
              {children}
              <CommandMenu />
            </NuqsAdapter>
            <TanStackDevtools
              config={{
                position: 'bottom-right'
              }}
              plugins={[
                {
                  name: 'Rovierr',
                  render: <TanStackRouterDevtoolsPanel />
                }
              ]}
            />
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
