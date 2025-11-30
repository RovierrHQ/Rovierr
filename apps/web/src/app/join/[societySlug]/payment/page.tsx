'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const PaymentPage = () => {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const societySlug = params.societySlug as string
  const [proofUrl, setProofUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Get current user session
  const { data: session } = authClient.useSession()

  // Fetch public registration page data
  const { data, isLoading } = useQuery(
    orpc.societyRegistration.public.getPageData.queryOptions({
      input: { societySlug }
    })
  )

  // Check user's join request status
  const { data: userStatus } = useQuery({
    ...orpc.societyRegistration.joinRequest.getUserStatus.queryOptions({
      input: {
        societyId: data?.society.id || '',
        userId: session?.user.id || ''
      }
    }),
    enabled: !!data?.society.id && !!session?.user.id
  })

  // Upload payment proof mutation
  const uploadProofMutation = useMutation(
    orpc.societyRegistration.payment.uploadProof.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-request-status', data?.society.id]
        })
        toast.success('Payment proof uploaded successfully!')
        router.push(`/join/${societySlug}`)
      },
      onError: () => {
        toast.error('Failed to upload payment proof')
      }
    })
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }

    try {
      setIsUploading(true)
      // TODO: Implement actual file upload to storage service
      // For now, create a data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofUrl(reader.result as string)
        setIsUploading(false)
        toast.success('File uploaded successfully')
      }
      reader.readAsDataURL(file)
    } catch {
      setIsUploading(false)
      toast.error('Failed to upload file')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofUrl) {
      toast.error('Please upload payment proof')
      return
    }
    if (!userStatus?.requestId) {
      toast.error('No join request found')
      return
    }
    uploadProofMutation.mutate({
      id: userStatus.requestId,
      proofUrl
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 font-bold text-2xl">Sign In Required</h1>
          <Button asChild className="mt-4">
            <Link href={`/login?redirect=/join/${societySlug}/payment`}>
              Sign In
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (!userStatus?.hasRequest) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 font-bold text-2xl">No Application Found</h1>
          <p className="mb-6 text-muted-foreground">
            You need to submit an application first.
          </p>
          <Button asChild>
            <Link href={`/join/${societySlug}/apply`}>Apply Now</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (userStatus.status !== 'payment_pending') {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h1 className="mb-2 font-bold text-2xl">Payment Not Required</h1>
          <p className="mb-6 text-muted-foreground">
            Your application status: {userStatus.status}
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
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/join/${societySlug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Society Page
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Upload Payment Proof</h1>
          <p className="text-muted-foreground">
            Upload proof of your membership fee payment for {data?.society.name}
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Payment amount */}
            {data?.form?.paymentAmount && (
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-1 text-muted-foreground text-sm">
                  Membership Fee
                </p>
                <p className="font-bold text-2xl">${data.form.paymentAmount}</p>
              </div>
            )}

            {/* Payment instructions */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold text-sm">
                Payment Instructions
              </h3>
              <p className="text-muted-foreground text-sm">
                {data?.form?.description ||
                  'Please contact the society for payment instructions.'}
              </p>
            </div>

            {/* File upload */}
            <div>
              <Label htmlFor="proof">
                Payment Proof <span className="text-destructive">*</span>
              </Label>
              <p className="mb-2 text-muted-foreground text-sm">
                Upload a screenshot or photo of your payment receipt (max 5MB)
              </p>
              <Input
                accept="image/*"
                disabled={isUploading}
                id="proof"
                onChange={handleFileUpload}
                type="file"
              />
              {isUploading && (
                <p className="mt-2 text-muted-foreground text-sm">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Uploading...
                </p>
              )}
            </div>

            {/* Preview */}
            {proofUrl && (
              <div>
                <Label>Preview</Label>
                <div className="mt-2 rounded-lg border p-4">
                  <img
                    alt="Payment proof"
                    className="h-auto w-full max-w-md"
                    src={proofUrl}
                  />
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end gap-2">
              <Button asChild type="button" variant="outline">
                <Link href={`/join/${societySlug}`}>Cancel</Link>
              </Button>
              <Button
                disabled={!proofUrl || uploadProofMutation.isPending}
                type="submit"
              >
                {uploadProofMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Payment Proof
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default PaymentPage
