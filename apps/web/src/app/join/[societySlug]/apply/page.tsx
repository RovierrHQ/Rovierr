'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { RegistrationForm } from '@/components/registration/registration-form'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const ApplyPage = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const societySlug = params.societySlug as string
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null)

  // Get current user session
  const { data: session } = authClient.useSession()

  // Fetch public registration page data
  const { data, isLoading, error } = useQuery(
    orpc.societyRegistration.public.getPageData.queryOptions({
      input: { societySlug }
    })
  )

  // Check if user already has a join request
  const { data: userStatus } = useQuery({
    ...orpc.societyRegistration.joinRequest.getUserStatus.queryOptions({
      input: {
        societyId: data?.society.id || '',
        userId: session?.user.id || ''
      }
    }),
    enabled: !!data?.society.id && !!session?.user.id
  })

  // Submit join request mutation
  const submitMutation = useMutation(
    orpc.societyRegistration.joinRequest.create.mutationOptions({
      onSuccess: (result) => {
        setIsSubmitted(true)
        setRequiresPayment(result.requiresPayment)
        if (data?.form?.paymentAmount) {
          setPaymentAmount(data.form.paymentAmount)
        }
        queryClient.invalidateQueries({
          queryKey: ['join-request-status', data?.society.id]
        })
        toast.success('Application submitted successfully!')
      },
      onError: (err: Error) => {
        if (err.message.includes('pending join request')) {
          toast.error('You already have a pending application')
        } else if (err.message.includes('already a member')) {
          toast.error('You are already a member of this society')
        } else {
          toast.error('Failed to submit application')
        }
      }
    })
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="mb-2 font-bold text-2xl">Society Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The society you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/spaces/societies/discover">Discover Societies</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 font-bold text-2xl">Sign In Required</h1>
          <p className="mb-6 text-muted-foreground">
            You need to sign in to apply for membership.
          </p>
          <Button asChild>
            <Link href={`/login?redirect=/join/${societySlug}/apply`}>
              Sign In
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (!data.isAvailable) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="mb-2 font-bold text-2xl">Registration Closed</h1>
          <p className="mb-6 text-muted-foreground">{data.unavailableReason}</p>
          <Button asChild>
            <Link href={`/join/${societySlug}`}>Back to Society Page</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (userStatus?.hasRequest) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h1 className="mb-2 font-bold text-2xl">
            Application Already Submitted
          </h1>
          <p className="mb-2 text-muted-foreground">
            Status: <span className="font-semibold">{userStatus.status}</span>
          </p>
          {userStatus.rejectionReason && (
            <p className="mb-6 text-muted-foreground text-sm">
              Reason: {userStatus.rejectionReason}
            </p>
          )}
          <Button asChild>
            <Link href={`/join/${societySlug}`}>Back to Society Page</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
            <h1 className="mb-2 font-bold text-2xl">Application Submitted!</h1>
            <p className="mb-6 text-muted-foreground">
              Your application to join {data.society.name} has been received.
            </p>
          </div>

          {requiresPayment && paymentAmount && (
            <div className="mb-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
              <h2 className="mb-2 font-semibold text-lg">Payment Required</h2>
              <p className="mb-4 text-muted-foreground">
                To complete your membership, please pay the membership fee of{' '}
                <span className="font-bold">${paymentAmount}</span>.
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Payment Instructions:</p>
                <p className="text-muted-foreground">
                  {data.form?.description ||
                    'Payment instructions will be provided by the society.'}
                </p>
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href={`/join/${societySlug}/payment`}>
                  Upload Payment Proof
                </Link>
              </Button>
            </div>
          )}

          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              You will receive an email notification once your application is
              reviewed.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link href={`/join/${societySlug}`}>Back to Society Page</Link>
              </Button>
              <Button asChild>
                <Link href="/spaces/societies/mine">My Societies</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!data.form) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 font-bold text-2xl">No Application Form</h1>
          <p className="mb-6 text-muted-foreground">
            This society hasn't set up an application form yet.
          </p>
          <Button asChild>
            <Link href={`/join/${societySlug}`}>Back to Society Page</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/join/${societySlug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Society Page
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">
            Apply to Join {data.society.name}
          </h1>
          <p className="text-muted-foreground">
            Fill out the application form below to join this society.
          </p>
        </div>

        <RegistrationForm
          form={data.form}
          onSubmit={(formResponseId) =>
            submitMutation.mutate({
              societyId: data.society.id,
              userId: session.user.id,
              formResponseId,
              paymentAmount: data.form?.paymentAmount || undefined
            })
          }
          society={data.society}
          user={session.user}
        />
      </div>
    </div>
  )
}

export default ApplyPage
