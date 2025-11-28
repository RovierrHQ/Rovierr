'use client'

import { Badge } from '@rov/ui/components/badge'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Shield, XCircle } from 'lucide-react'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'

export function VerificationSettings() {
  const { data: profileInfo } = useQuery(orpc.user.profile.info.queryOptions())
  const { data: verificationStatus } = useQuery(
    orpc.user.profile.verifyStudent.getVerificationStatus.queryOptions()
  )

  const studentVerified = profileInfo?.studentStatusVerified

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">Student Verification</h3>
          <p className="text-muted-foreground text-xs">
            Verify your student status to access exclusive features
          </p>
        </div>
        {studentVerified ? (
          <Badge className="gap-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified
          </Badge>
        ) : (
          <Badge className="gap-1.5" variant="secondary">
            <XCircle className="h-3.5 w-3.5" />
            Not Verified
          </Badge>
        )}
      </div>

      {!studentVerified && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Verify Your Student Status</h3>
          <p className="max-w-md text-muted-foreground text-sm">
            Get access to student exclusive features and benefits by verifying
            your enrollment. Complete verification by uploading your student ID
            card and verifying your university email.
          </p>
          {verificationStatus?.verificationStep && (
            <p className="text-muted-foreground text-sm">
              You have an incomplete verification. Continue from where you left
              off on your profile page.
            </p>
          )}
          <Link
            className="mt-4 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            href="/profile"
          >
            Go to Profile to Verify
          </Link>
        </div>
      )}

      {studentVerified && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="mb-4 rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="font-semibold text-lg">Student Status Verified</h3>
          <p className="text-muted-foreground text-sm">
            You now have access to all student benefits and features
          </p>
        </div>
      )}
    </div>
  )
}
