'use client'

import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@rov/ui/components/input-group'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@rov/ui/components/input-otp'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Mail,
  Trash2,
  Upload
} from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface IdCardItemProps {
  card: {
    id: string
    imageUrl: string
    university: string | null
    studentId: string | null
    isVerified: boolean
  }
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}

function IdCardItem({ card, isSelected, onSelect, onDelete }: IdCardItemProps) {
  return (
    <div
      className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition-colors ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={() => onSelect(card.id)}
    >
      <div className="flex items-center gap-3">
        <img
          alt="Student ID"
          className="h-12 w-12 rounded border border-border object-cover"
          src={card.imageUrl}
        />
        <div className="flex-1">
          <p className="font-medium text-sm">
            {card.university ?? 'Unknown University'}
          </p>
          {card.studentId && (
            <p className="text-muted-foreground text-xs">
              Student ID: {card.studentId}
            </p>
          )}
          {card.isVerified && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-green-600 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
      </div>
      {!card.isVerified && (
        <Button
          className="flex-shrink-0"
          onClick={(e) => onDelete(card.id, e)}
          size="sm"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}

export function VerificationPrompt() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'upload' | 'email' | 'otp'>('upload')
  const [studentIdImage, setStudentIdImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedStudentIdCardId, setSelectedStudentIdCardId] = useState<
    string | null
  >(null)
  const [emailLocalPart, setEmailLocalPart] = useState('')
  const [otp, setOtp] = useState('')
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [parsedData, setParsedData] = useState<{
    university: string | null
    studentId: string | null
  } | null>(null)

  // Fetch universities from database
  const { data: universitiesData } = useQuery(
    orpc.university.list.queryOptions()
  )

  // Fetch verification status to restore step
  const { data: verificationStatus } = useQuery(
    orpc.user.profile.verifyStudent.getVerificationStatus.queryOptions()
  )

  // Fetch existing student ID cards
  const { data: idCardsData, refetch: refetchIdCards } = useQuery(
    orpc.user.profile.verifyStudent.listIdCards.queryOptions()
  )

  const existingIdCards = idCardsData?.idCards ?? []

  const universities = universitiesData?.universities ?? []
  const selectedUniversity = universities.find(
    (uni) => uni.id === selectedUniversityId
  )

  // Restore step and parsed data from stored verification status
  useEffect(() => {
    if (verificationStatus) {
      if (verificationStatus.verificationStep) {
        setStep(verificationStatus.verificationStep)
      }
      if (verificationStatus.parsedData) {
        setParsedData(verificationStatus.parsedData)
      }
      // Note: We don't restore image preview from URL as it requires fetching the image
      // User will need to re-upload if they want to see it, but parsing result is restored
    }
  }, [verificationStatus])

  // Set default university when data loads
  useEffect(() => {
    if (universities.length > 0 && !selectedUniversityId) {
      setSelectedUniversityId(universities[0]?.id ?? '')
    }
  }, [universities, selectedUniversityId])

  // Set default domain when university changes
  useEffect(() => {
    if (selectedUniversity?.validEmailDomains.length) {
      setSelectedDomain(selectedUniversity.validEmailDomains[0])
    }
  }, [selectedUniversity])

  const uploadMutation = useMutation(
    orpc.user.profile.verifyStudent.uploadIdCard.mutationOptions({
      onSuccess: (data) => {
        setSelectedStudentIdCardId(data.id)
        setParsedData({
          university: data.university,
          studentId: data.studentId
        })
        setStep('email')
        refetchIdCards()
        toast.success('Student ID parsed successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to parse student ID')
      }
    })
  )

  const deleteIdCardMutation = useMutation(
    orpc.user.profile.verifyStudent.deleteIdCard.mutationOptions({
      onSuccess: () => {
        refetchIdCards()
        if (selectedStudentIdCardId) {
          setSelectedStudentIdCardId(null)
          setParsedData(null)
        }
        toast.success('Student ID card deleted')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to delete student ID card')
      }
    })
  )

  const sendOTPMutation = useMutation(
    orpc.user.profile.verifyStudent.sendVerificationOTP.mutationOptions({
      onSuccess: () => {
        setStep('otp')
        toast.success('Verification code sent to your email')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to send verification code')
      }
    })
  )

  const verifyOTPMutation = useMutation(
    orpc.user.profile.verifyStudent.verifyOTP.mutationOptions({
      onSuccess: async () => {
        // Invalidate and refetch all relevant queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
          queryClient.invalidateQueries({
            queryKey: ['better-auth', 'session']
          }),
          queryClient.refetchQueries({ queryKey: ['better-auth', 'session'] }),
          queryClient.refetchQueries({ queryKey: ['user', 'profile'] })
        ])

        toast.success('Student status verified successfully!')

        // Reset form
        setStep('upload')
        setStudentIdImage(null)
        setImagePreview(null)
        setSelectedStudentIdCardId(null)
        setEmailLocalPart('')
        setOtp('')
        setParsedData(null)
        refetchIdCards()

        window.location.reload()
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to verify code')
      }
    })
  )

  const resendOTPMutation = useMutation(
    orpc.user.profile.verifyStudent.resendOTP.mutationOptions({
      onSuccess: () => {
        toast.success('Verification code resent')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to resend code')
      }
    })
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setStudentIdImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectExistingIdCard = (idCardId: string) => {
    const selectedCard = existingIdCards.find((card) => card.id === idCardId)
    if (selectedCard) {
      setSelectedStudentIdCardId(idCardId)
      setParsedData({
        university: selectedCard.university,
        studentId: selectedCard.studentId
      })
      setImagePreview(selectedCard.imageUrl)
      setStep('email')
    }
  }

  const handleDeleteIdCard = async (idCardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteIdCardMutation.mutateAsync({ id: idCardId })
    } catch {
      // Error handled by mutation
    }
  }

  const handleContinueFromUpload = async () => {
    if (!(studentIdImage || selectedStudentIdCardId)) {
      toast.error(
        'Please upload your student ID card or select an existing one'
      )
      return
    }

    if (selectedStudentIdCardId) {
      // Use existing ID card
      const selectedCard = existingIdCards.find(
        (card) => card.id === selectedStudentIdCardId
      )
      if (selectedCard) {
        setParsedData({
          university: selectedCard.university,
          studentId: selectedCard.studentId
        })
        setStep('email')
      }
      return
    }

    // Upload new ID card
    if (!studentIdImage) {
      toast.error('Please upload your student ID card')
      return
    }

    try {
      const base64 = await fileToBase64(studentIdImage)
      await uploadMutation.mutateAsync({ imageBase64: base64 })
    } catch {
      // Error handled by mutation
    }
  }

  const handleSendOTP = async () => {
    if (!emailLocalPart.trim()) {
      toast.error('Please enter your email username')
      return
    }

    if (!selectedUniversity) {
      toast.error('Please select a university')
      return
    }

    if (!selectedStudentIdCardId) {
      toast.error('Please select or upload a student ID card')
      return
    }

    // Construct full email with selected domain (add @ since validEmailDomains doesn't include it)
    const email = `${emailLocalPart.trim()}@${selectedDomain}`

    try {
      await sendOTPMutation.mutateAsync({
        email,
        universityId: selectedUniversityId,
        studentIdCardId: selectedStudentIdCardId
      })
    } catch {
      // Error handled by mutation
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    try {
      await verifyOTPMutation.mutateAsync({ otp })
    } catch {
      // Error handled by mutation
    }
  }

  const handleOTPChange = (value: string) => {
    setOtp(value)
  }

  const handleResendOTP = async () => {
    try {
      await resendOTPMutation.mutateAsync({})
    } catch {
      // Error handled by mutation
    }
  }

  const loading =
    uploadMutation.isPending ||
    sendOTPMutation.isPending ||
    verifyOTPMutation.isPending ||
    resendOTPMutation.isPending

  return (
    <Card className="space-y-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-lg">
            Verify Your Student Status
          </h3>
          <p className="text-muted-foreground text-sm">
            {step === 'upload' &&
              'Upload your student ID card to begin verification'}
            {step === 'email' &&
              'Verify your university email to unlock full access'}
            {step === 'otp' && 'Enter the verification code sent to your email'}
          </p>
        </div>
      </div>

      {step === 'upload' && (
        <div className="space-y-4">
          {/* Show existing ID cards if any */}
          {existingIdCards.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Existing Student ID Cards</p>
              <div className="grid gap-2">
                {existingIdCards.map((card) => (
                  <IdCardItem
                    card={card}
                    isSelected={selectedStudentIdCardId === card.id}
                    key={card.id}
                    onDelete={handleDeleteIdCard}
                    onSelect={handleSelectExistingIdCard}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="student-id-upload">
              {existingIdCards.length > 0
                ? 'Or Upload New Student ID Card'
                : 'Upload Student ID Card'}
            </label>
            <div className="rounded-lg border-2 border-border border-dashed p-6 text-center transition-colors hover:border-primary/50">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img
                      alt="Student ID preview"
                      className="max-h-48 rounded-lg border border-border"
                      src={imagePreview || '/placeholder.svg'}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setStudentIdImage(null)
                      setImagePreview(null)
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    type="file"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Click to upload student ID
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Your student ID will be securely processed and verified. We
              protect your privacy.
            </p>
          </div>

          <Button
            className="w-full"
            disabled={loading || !(studentIdImage || selectedStudentIdCardId)}
            onClick={handleContinueFromUpload}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Continue to Email Verification
              </>
            )}
          </Button>
        </div>
      )}
      {step === 'email' && (
        <div className="space-y-4">
          {parsedData?.university && (
            <Alert className="border-primary/30 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Detected university: <strong>{parsedData.university}</strong>
                {parsedData.studentId && (
                  <> • Student ID: {parsedData.studentId}</>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="university-select">
              Select Your University
            </label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              id="university-select"
              onChange={(e) => setSelectedUniversityId(e.target.value)}
              value={selectedUniversityId}
            >
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="university-email">
              University Email Address
            </label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Mail className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="university-email"
                onChange={(e) => {
                  // Remove @ if user tries to add it
                  const value = e.target.value.replace('@', '')
                  setEmailLocalPart(value)
                }}
                placeholder="your.name"
                type="text"
                value={emailLocalPart}
              />
              <InputGroupAddon align="inline-end">
                {selectedUniversity &&
                selectedUniversity.validEmailDomains.length > 0 ? (
                  <Select
                    disabled={selectedUniversity.validEmailDomains.length === 1}
                    onValueChange={setSelectedDomain}
                    value={selectedDomain}
                  >
                    <SelectTrigger className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0">
                      <SelectValue>
                        {selectedDomain ? `@${selectedDomain}` : ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedUniversity.validEmailDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          @{domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  '@university.edu'
                )}
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => setStep('upload')}
              variant="outline"
            >
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={loading || !emailLocalPart.trim()}
              onClick={handleSendOTP}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Code'
              )}
            </Button>
          </div>
        </div>
      )}
      {step === 'otp' && (
        <div className="space-y-4">
          <Alert className="border-primary/30 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              We've sent a 6-digit code to{' '}
              <strong>
                {emailLocalPart}
                {selectedDomain ? `@${selectedDomain}` : '@university.edu'}
              </strong>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center justify-center gap-2">
            <label className="font-medium text-sm" htmlFor="otp-input">
              Enter Verification Code
            </label>
            <InputOTP
              id="otp-input"
              maxLength={6}
              onChange={handleOTPChange}
              value={otp}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: okay for otp
                  <InputOTPSlot index={index} key={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setStep('email')}
                variant="outline"
              >
                Change Email
              </Button>
              <Button
                className="flex-1"
                disabled={loading || otp.length !== 6}
                onClick={handleVerifyOTP}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>

            <button
              className="w-full text-center text-primary text-sm hover:underline"
              disabled={loading}
              onClick={handleResendOTP}
              type="button"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
