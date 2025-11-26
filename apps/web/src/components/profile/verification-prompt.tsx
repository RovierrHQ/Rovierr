'use client'

import { Alert, AlertDescription, AlertTitle } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export function VerificationPrompt() {
  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <ShieldAlert className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-900 dark:text-yellow-100">
        Verify Your Student Status
      </AlertTitle>
      <AlertDescription className="mt-2 text-yellow-800 dark:text-yellow-200">
        <p className="mb-3">
          Get access to student-exclusive features and benefits by verifying
          your enrollment.
        </p>
        <Link href="/profile/verify-student-status">
          <Button
            className="bg-yellow-600 text-white hover:bg-yellow-700"
            size="sm"
          >
            Verify Now
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
