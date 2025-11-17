'use client'

import { Button } from '@rov/ui/components/button'
import { SeparatorWithLabel } from '@rov/ui/components/separator-with-label'
import Image from 'next/image'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
  return (
    <section className="relative isolate min-h-svh overflow-hidden">
      <div className="mx-auto grid min-h-svh grid-cols-1 md:grid-cols-2">
        <div className="flex h-full flex-col justify-center space-y-6 bg-muted/40 p-6 sm:p-8 md:p-10">
          <Image
            alt="rovierr Login page"
            className="top-5 left-5 sm:top-8 sm:left-8 md:absolute"
            height={28}
            src="/rovierr-login-logo.svg"
            width={96}
          />

          <div className="mx-auto w-full max-w-sm space-y-8 sm:max-w-md lg:max-w-lg lg:space-y-10">
            <Image
              alt="rovierr login page image"
              className="w-full rounded-xl object-cover"
              height={334}
              src="/rovierr-login-page-image.png"
              width={500}
            />

            <h3 className="text-center font-semibold text-lg sm:text-xl">
              Join your campus community — collaborate, organize, and grow your
              club together
            </h3>

            <ul className="space-y-1.5 text-muted-foreground text-sm sm:space-y-2 sm:text-base lg:ml-10">
              <li className="ml-6 list-disc">
                All your university clubs in one place.
              </li>
              <li className="ml-6 list-disc">
                Manage events, members, and shared tasks.
              </li>
              <li className="ml-6 list-disc">
                Stay updated with discussions and announcements.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex h-full flex-col justify-between p-6 text-center sm:p-8 md:p-10">
          <div className="mx-auto flex h-full w-full max-w-sm flex-col items-center justify-center sm:max-w-md md:max-w-lg">
            <div className="w-full space-y-6">
              <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl">
                Welcome Back 👋
              </h2>

              <p className="mt-1 text-muted-foreground text-sm sm:text-base md:text-lg">
                Continue managing your club activities and stay connected with
                your team.
              </p>

              <Button
                className="mt-4 flex w-full items-center justify-center gap-3 py-5 sm:py-6"
                onClick={() => {
                  authClient.signIn.social({
                    provider: 'google',
                    callbackURL: window.origin
                  })
                }}
              >
                <Image
                  alt="google logo"
                  height={16}
                  src="/Google.svg"
                  width={16}
                />
                Sign in with Google
              </Button>

              <SeparatorWithLabel className="my-6" label="OR" />

              <Button
                className="flex w-full items-center justify-center gap-3 py-5 sm:py-6"
                variant="outline"
              >
                <Image
                  alt="discord logo"
                  height={16}
                  src="/ic_outline-discord.png"
                  width={16}
                />
                Continue with Discord
              </Button>

              <span className="mx-auto mt-4 block w-full max-w-xs text-center text-muted-foreground text-xs sm:text-sm">
                By clicking continue, you agree to our{' '}
                <Link className="underline" href="#">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link className="underline" href="#">
                  Privacy Policy
                </Link>
              </span>
            </div>
          </div>

          <div className="mt-10 text-center text-muted-foreground text-xs sm:text-sm">
            © 2025 ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </section>
  )
}
