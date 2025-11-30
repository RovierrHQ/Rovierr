'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Checkbox } from '@rov/ui/components/checkbox'
import { useAppForm } from '@rov/ui/components/form/index'
import { Input } from '@rov/ui/components/input'
import { useStore } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { orpc } from '@/utils/orpc'

// Enrollment schema
const enrollmentSchema = z.object({
  institutionEnrollmentId: z.string().min(1, 'Please select an institution'),
  programId: z.string().min(1, 'Please select a program'),
  termId: z.string().min(1, 'Please select a semester'),
  courseIds: z.array(z.string()).min(1, 'Please select at least one course')
})

type EnrollmentInput = z.infer<typeof enrollmentSchema>

export default function AcademicOnboardingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null)
  const [courseSearch, setCourseSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Fetch verified institution enrollments
  const { data: verifiedInstitutions } = useQuery(
    orpc.academic.enrollment.getVerifiedInstitutions.queryOptions({
      input: {}
    })
  )

  // Fetch programs for selected institution
  const { data: programs } = useQuery(
    orpc.academic.enrollment.getPrograms.queryOptions({
      input: { institutionId: selectedInstitutionId || '' },
      enabled: !!selectedInstitutionId
    })
  )

  // Fetch terms for selected institution
  const { data: terms } = useQuery({
    ...orpc.academic.enrollment.getTerms.queryOptions({
      input: { institutionId: selectedInstitutionId || '' }
    }),
    enabled: step === 3 && !!selectedInstitutionId
  })

  // Enrollment mutation
  const enrollProgramMutation = useMutation(
    orpc.academic.enrollment.enrollProgram.mutationOptions({
      onSuccess: () => {
        toast.success('Program enrolled successfully!')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to enroll in program')
      }
    })
  )

  const enrollCoursesMutation = useMutation(
    orpc.academic.enrollment.enrollCourses.mutationOptions({
      onSuccess: async () => {
        // Invalidate enrollment queries to refresh sidebar and dashboard
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.academic.enrollment.getEnrollmentStatus.queryOptions(
              { input: {} }
            ).queryKey
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.academic.enrollment.getEnrollment.queryOptions({
              input: {}
            }).queryKey
          })
        ])
        toast.success('Enrollment completed successfully!')
        router.push('/spaces/academics/dashboard')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to enroll in courses')
      }
    })
  )

  const form = useAppForm({
    validators: { onSubmit: enrollmentSchema },
    defaultValues: {
      institutionEnrollmentId: '',
      programId: '',
      termId: '',
      courseIds: []
    } as EnrollmentInput,
    onSubmit: async ({ value }) => {
      // First enroll in program
      await enrollProgramMutation.mutateAsync({
        programId: value.programId,
        institutionEnrollmentId: value.institutionEnrollmentId,
        type: 'major'
      })

      // Then enroll in courses
      await enrollCoursesMutation.mutateAsync({
        termId: value.termId,
        courseOfferingIds: value.courseIds
      })
    }
  })

  // Auto-update selectedInstitutionId when form value changes
  useEffect(() => {
    const institutionEnrollmentId = form.state.values.institutionEnrollmentId
    if (institutionEnrollmentId && verifiedInstitutions?.institutions) {
      const selectedEnrollment = verifiedInstitutions.institutions.find(
        (inst) => inst.enrollmentId === institutionEnrollmentId
      )
      if (selectedEnrollment) {
        setSelectedInstitutionId(selectedEnrollment.institutionId)
      }
    }
  }, [form.state.values.institutionEnrollmentId, verifiedInstitutions])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(courseSearch)
    }, 500)

    return () => clearTimeout(timer)
  }, [courseSearch])

  // Fetch courses for selected term with search
  const { data: courses, isLoading: isLoadingCourses } = useQuery(
    orpc.academic.enrollment.getCourses.queryOptions({
      input: {
        termId: form.state.values.termId || '',
        search: debouncedSearch
      },
      enabled:
        step === 4 && !!form.state.values.termId && debouncedSearch.length >= 4
    })
  )

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
      // Clear course selection when entering step 4
      if (step === 3) {
        form.setFieldValue('courseIds', [])
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const selectedCourses = useStore(
    form.store,
    (state) => state.values.courseIds
  )

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
        {[1, 2, 3, 4].map((s) => {
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
              {s < 4 && (
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
            {step === 1 && 'Select Your Institution'}
            {step === 2 && 'Select Your Program'}
            {step === 3 && 'Select Your Semester'}
            {step === 4 && 'Select Your Courses'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Choose from your verified institution enrollments'}
            {step === 2 && 'Choose your major or degree program'}
            {step === 3 && 'Select the current academic term'}
            {step === 4 && "Pick the courses you're enrolled in this semester"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (step === 4) {
                form.handleSubmit()
              } else {
                handleNext()
              }
            }}
          >
            {/* Step 1: Select Institution */}
            {step === 1 && (
              <form.AppField
                children={(field) => (
                  <field.Select
                    label="Institution"
                    options={
                      verifiedInstitutions?.institutions.map(
                        (inst: {
                          enrollmentId: string
                          institutionName: string
                          studentId: string
                          email: string
                          emailVerified: boolean
                          studentStatusVerified: boolean
                        }) => ({
                          label: `${inst.institutionName} (${inst.studentId})`,
                          value: inst.enrollmentId,
                          disabled: !(
                            inst.emailVerified && inst.studentStatusVerified
                          )
                        })
                      ) ?? []
                    }
                    placeholder="Select your institution"
                  />
                )}
                name="institutionEnrollmentId"
              />
            )}

            {/* Step 2: Select Program */}
            {step === 2 && (
              <form.AppField
                children={(field) => (
                  <field.Select
                    label="Program"
                    options={
                      programs?.programs.map(
                        (program: {
                          name: string
                          id: string
                          code: string | null
                        }) => ({
                          label: program.code
                            ? `${program.code} - ${program.name}`
                            : program.name,
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

            {/* Step 3: Select Term */}
            {step === 3 && (
              <form.AppField
                children={(field) => (
                  <field.Select
                    label="Semester/Term"
                    options={
                      terms?.terms.map(
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

            {/* Step 4: Select Courses */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="font-medium text-sm"
                    htmlFor="course-search-input"
                  >
                    Search Courses
                  </label>
                  <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      id="course-search-input"
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Type at least 4 characters to search..."
                      value={courseSearch}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Search by course code or title (minimum 4 characters)
                  </p>
                </div>

                {(() => {
                  if (courseSearch.length < 4) {
                    return (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Start typing to search for courses
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Enter at least 4 characters to see results
                        </p>
                      </div>
                    )
                  }

                  if (isLoadingCourses) {
                    return (
                      <div className="rounded-lg border p-8 text-center text-muted-foreground">
                        Searching courses...
                      </div>
                    )
                  }

                  if (courses && courses.courses.length > 0) {
                    return (
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                          Found {courses.courses.length} course(s). Select the
                          ones you're taking:
                        </p>
                        <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border p-4">
                          {courses.courses.map((course) => (
                            <label
                              className="flex cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-accent"
                              htmlFor={course.id}
                              key={course.id}
                            >
                              <Checkbox
                                checked={form.state.values.courseIds.includes(
                                  course.id
                                )}
                                className="mt-1"
                                id={course.id}
                                onCheckedChange={() => {
                                  const isCurrentlySelected =
                                    selectedCourses.includes(course.id)

                                  if (isCurrentlySelected) {
                                    // Remove the ID
                                    const newIds = selectedCourses.filter(
                                      (id) => id !== course.id
                                    )

                                    form.setFieldValue('courseIds', newIds)
                                  } else {
                                    // Add the ID
                                    const newIds = [
                                      ...selectedCourses,
                                      course.id
                                    ]

                                    form.setFieldValue('courseIds', newIds)
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-medium">
                                  {course.code ? `${course.code} - ` : ''}
                                  {course.title}
                                </div>
                                {(course.instructor ||
                                  course.section ||
                                  course.schedule) && (
                                  <div className="text-muted-foreground text-sm">
                                    {course.section &&
                                      `Section ${course.section}`}
                                    {course.instructor &&
                                      ` • ${course.instructor}`}
                                    {course.schedule && ` • ${course.schedule}`}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className="rounded-lg border p-4 text-center text-muted-foreground">
                      No courses found matching "{courseSearch}"
                    </div>
                  )
                })()}

                {form.state.values.courseIds.length > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="font-medium text-sm">
                      {form.state.values.courseIds.length} course(s) selected
                    </p>
                  </div>
                )}
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
                disabled={
                  form.state.isSubmitting ||
                  enrollProgramMutation.isPending ||
                  enrollCoursesMutation.isPending
                }
                type="submit"
              >
                {step === 4 ? (
                  form.state.isSubmitting ||
                  enrollProgramMutation.isPending ||
                  enrollCoursesMutation.isPending ? (
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
