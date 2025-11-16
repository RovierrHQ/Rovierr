'use client'
import { Button } from '@rov/ui/components/button'
import { SeparatorWithLabel } from '@rov/ui/components/separator-with-label'
import Image from 'next/image'
import Link from 'next/link'
import Topnav from '@/components/layout/top-nav'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
  return (
    <section className="relative isolate h-svh overflow-hidden">
      <Topnav enableUserDropdown={false} />

      <div className="mx-auto grid h-[calc(100svh-64px)] max-w-7xl grid-cols-1 md:grid-cols-2">
        <div className="flex h-full flex-col justify-center space-y-6 bg-muted/40 p-8 md:p-10">
          <Image
            alt="rovierr login page image"
            className="w-full rounded-md"
            height={334}
            src="/rovierr-login-page-image.png"
            width={500}
          />

          <h3 className="font-semibold text-md md:text-xl lg:text-2xl">
            Join your campus community — collaborate, organize, and grow your
            club together
          </h3>

          <ul className="space-y-2 text-base text-muted-foreground md:text-lg">
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

        <div className="flex h-full flex-col justify-center space-y-6 p-8 text-center md:p-10">
          <div className="mx-auto w-full max-w-sm md:max-w-md">
            <h2 className="font-bold text-3xl md:text-4xl">Welcome Back 👋</h2>

            <p className="mt-2 text-muted-foreground md:text-lg">
              Continue managing your club activities and stay connected with
              your team.
            </p>

            <Button
              className="mt-6 flex w-full items-center justify-center gap-3"
              onClick={() => {
                authClient.signIn.social({
                  provider: 'google',
                  callbackURL: window.origin
                })
              }}
            >
              <Image
                alt="google logo"
                height={30}
                src="/Google.svg"
                width={30}
              />
              Sign in with Google
            </Button>

            <SeparatorWithLabel className="my-6" label="OR" />

            <Button
              className="flex w-full items-center justify-center gap-3"
              variant="outline"
            >
              <Image
                alt="discord logo"
                height={30}
                src="/ic_outline-discord.png"
                width={30}
              />
              Continue with Discord
            </Button>

            <span className="mt-4 block text-center text-muted-foreground text-sm">
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
      </div>
    </section>
  )
}
