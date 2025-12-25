import { CommandMenu } from '@web/components/command-menu'
import Providers from '@web/components/providers'
import '@rov/ui/globals.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

// Initialize localization for the web app (Server Side / Client Side)
// Since this is a server component by default in Next.js app dir, this side effect might need to be in a client component
// or we just init here for SSR if the package supports it.
// However, the package uses standard i18next which works.
// Better to make a Client Provider if we need state, but for now just init.
// Actually, `initLocalization` returns a promise. We should probably await it or just call it.
// For a simple demo/fix in Next.js, calling it at module level or top of layout is a start.
// But `apps/web` might be client-heavy.
// Let's import it and call it.
import { initLocalization } from '@rov/localization'

initLocalization('en') // Default to 'en' for web for now

export const metadata: Metadata = {
  title: 'rovierr',
  description: 'rovierr'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta content="Rovierr" name="apple-mobile-web-app-title" />
        <link href="/manifest.json" rel="manifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-svh antialiased`}
      >
        <Providers>{children}</Providers>
        <CommandMenu />
      </body>
    </html>
  )
}
