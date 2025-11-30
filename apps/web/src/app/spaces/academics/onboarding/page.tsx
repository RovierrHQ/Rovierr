'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

// Enrollment schema
const enrollmentSchema = z.object({
  programId: z.string().min(1, 'Please select a program'),
  termId: z.string().min(1, 'Please select a semester'),
  courseIds: z.array(z.string()).min(1, 'Please select at least one course')
})

type EnrollmentInput = z.infer<typeof enrollmentSchema>

export default function AcademicOnboardingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)

  // TODO: Get user's institution from session/profile
  const institutionId = 'temp-institution-id'

  // Fetch programs
  const { data: programs } = useQuery({
    queryKey: ['academic', 'programs', institutionId],
    queryFn: () => {
      // TODO: Replace with actual ORPC call
      // return await orpc.academic.enrollment.getPrograms.call({ institutionId })
      return []
    },
    enabled: step === 1
  })

  // Fetch terms
  const { data: terms } = useQuery({
    queryKey: ['academic', 'terms', institutionId],
    queryFn: () => {
      // TODO: Replace with actual ORPC call
      // return await orpc.academic.enrollment.getTerms.call({ institutionId })
      return []
    },
    enabled: step === 2
  })

  // Fetch courses (will be used when implementing course selection)
  // const { data: courses } = useQuery({
  //   queryKey: ['academic', 'courses'],
  //   queryFn: () => {
  //     // TODO: Replace with actual ORPC call based on selected program and term
  //     // return await orpc.academic.enrollment.getCourses.call({ programId, termId })
  //     return []
  //   },
  //   enabled: step === 3
  // })

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: (data: EnrollmentInput) => {
      // TODO: Replace with actual ORPC calls
      // await orpc.academic.enrollment.enrollProgram.call({ programId: data.programId })
      // await orpc.academic.enrollment.enrollCourses.call({
      //   termId: data.termId,
      //   courseIds: data.courseIds
      // })
      return Promise.resolve(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic', 'enrollment'] })
      toast.success('Enrollment completed successfully!')
      router.push('/spaces/academics/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete enrollment')
    }
  })

  const form = useAppForm({
    validators: { onSubmit: enrollmentSchema },
    defaultValues: {
      programId: '',
      termId: '',
      courseIds: []
    } as EnrollmentInput,
    onSubmit: async ({ value }) => {
      await enrollMutation.mutateAsync(value)
    }
  })

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 font-bold text-3xl">Welcome to Academic Space</h1>
        <p className="text-muted-foreground">
          Let's set up your academic profile to get started
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => {
          const isActive = s === step
          const isCompleted = s < step

          let stepClass = 'border-muted bg-background text-muted-foreground'
          if (isActive || isCompleted) {
            stepClass = 'border-primary bg-primary text-primary-foreground'
          }

          return (
            <div className="flex items-center" key={s}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${stepClass}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{s}</span>
                )}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-16 ${isCompleted ? 'bg-primary' : 'bg-muted'}`}
                />
              )}
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Select Your Program'}
            {step === 2 && 'Select Your Semester'}
            {step === 3 && 'Select Your Courses'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Choose your major or degree program'}
            {step === 2 && 'Select the current academic term'}
            {step === 3 && "Pick the courses you're enrolled in this semester"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (step === 3) {
                form.handleSubmit()
              } else {
                handleNext()
              }
            }}
          >
            {/* Step 1: Select Program */}
            {step === 1 && (
              <form.AppField
                children={(field) => (
                  <field.Select
                    label="Program"
                    options={
                      programs?.map(
                        (program: { name: string; id: string }) => ({
                          label: program.name,
                          value: program.id
                        })
                      ) ?? []
                    }
                    placeholder="Select your program"
                  />
                )}
                name="programId"
              />
            )}

            {/* Step 2: Select Term */}
            {step === 2 && (
              <form.AppField
                children={(field) => (
                  <field.Select
                    label="Semester/Term"
                    options={
                      terms?.map(
                        (term: {
                          termName: string
                          academicYear: string
                          id: string
                        }) => ({
                          label: `${term.termName} ${term.academicYear}`,
                          value: term.id
                        })
                      ) ?? []
                    }
                    placeholder="Select current semester"
                  />
                )}
                name="termId"
              />
            )}

            {/* Step 3: Select Courses */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Select all courses you're taking this semester
                </p>
                {/* TODO: Implement multi-select for courses */}
                <div className="rounded-lg border p-4 text-center text-muted-foreground">
                  Course selection will be implemented with ORPC integration
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              <Button
                disabled={step === 1}
                onClick={handleBack}
                type="button"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                disabled={form.state.isSubmitting || enrollMutation.isPending}
                type="submit"
              >
                {step === 3 ? (
                  form.state.isSubmitting || enrollMutation.isPending ? (
                    'Completing...'
                  ) : (
                    'Complete Enrollment'
                  )
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
