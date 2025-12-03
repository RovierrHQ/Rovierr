import { CommandMenu } from '@/components/command-menu'
import Providers from '@/components/providers'
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
