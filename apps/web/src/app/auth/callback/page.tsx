'use client'

import { useEffect } from 'react'

export default function AuthCallbackPage() {
  useEffect(() => {
    // Notify the parent window that the auth flow completed
    if (window.opener) {
      window.opener.postMessage(
        'google-calendar-connected',
        window.location.origin
      )
      window.close()
    } else {
      // If not in a popup, redirect to dashboard
      window.location.href = '/dashboard'
    }
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-semibold text-2xl">Connecting your calendar...</h1>
        <p className="mt-2 text-muted-foreground">
          You can close this window if it doesn't close automatically.
        </p>
      </div>
    </div>
  )
}
