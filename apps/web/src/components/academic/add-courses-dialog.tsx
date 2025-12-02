'use client'

import { Button } from '@rov/ui/components/button'
import { Checkbox } from '@rov/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import { Input } from '@rov/ui/components/input'
import { useStore } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { orpc } from '@/utils/orpc'

const addCoursesSchema = z.object({
  termId: z.string().min(1, 'Please select a term'),
  courseIds: z.array(z.string()).min(1, 'Please select at least one course')
})

type AddCoursesInput = z.infer<typeof addCoursesSchema>

interface AddCoursesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCoursesDialog({
  open,
  onOpenChange
}: AddCoursesDialogProps) {
  const queryClient = useQueryClient()
  const [courseSearch, setCourseSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const form = useAppForm({
    validators: { onSubmit: addCoursesSchema },
    defaultValues: {
      termId: '',
      courseIds: []
    } as AddCoursesInput,
    onSubmit: async ({ value }) => {
      await enrollCoursesMutation.mutateAsync({
        termId: value.termId,
        courseOfferingIds: value.courseIds
      })
    }
  })

  // Fetch current enrollment to pre-fill program and term
  const { data: enrollment } = useQuery(
    orpc.academic.enrollment.getEnrollment.queryOptions({
      input: {}
    })
  )

  // Fetch terms for the institution
  const { data: terms } = useQuery({
    ...orpc.academic.enrollment.getTerms.queryOptions({
      input: { institutionId: enrollment?.program.institutionId || '' }
    }),
    enabled: !!enrollment?.program.institutionId && open
  })

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
      enabled: !!form.state.values.termId && debouncedSearch.length >= 4 && open
    })
  )

  // Enrollment mutation (only courses, no program enrollment)
  const enrollCoursesMutation = useMutation(
    orpc.academic.enrollment.enrollCourses.mutationOptions({
      onSuccess: async () => {
        // Invalidate enrollment queries to refresh sidebar and dashboard
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.academic.enrollment.getEnrollmentStatus.queryOptions(
              {
                input: {}
              }
            ).queryKey
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.academic.enrollment.getEnrollment.queryOptions({
              input: {}
            }).queryKey
          })
        ])
        toast.success('Courses added successfully!')
        onOpenChange(false)
        // Reset form
        form.setFieldValue('courseIds', [])
        setCourseSearch('')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to enroll in courses')
      }
    })
  )

  // Pre-fill term with current term when enrollment data is available
  useEffect(() => {
    if (enrollment?.term.id && !form.state.values.termId) {
      form.setFieldValue('termId', enrollment.term.id)
    }
  }, [enrollment?.term.id, form])

  // Clear course selection when term changes
  useEffect(() => {
    if (form.state.values.termId) {
      form.setFieldValue('courseIds', [])
      setCourseSearch('')
    }
  }, [form])

  const selectedCourses = useStore(
    form.store,
    (state) => state.values.courseIds
  )

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Courses</DialogTitle>
          <DialogDescription>
            Select a term and choose the courses you want to add to your
            enrollment.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          {/* Term Selection */}
          <div className="mb-6 space-y-2">
            <form.AppField
              children={(field) => (
                <field.Select
                  label="Term/Semester"
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
                  placeholder="Select term"
                />
              )}
              name="termId"
            />
          </div>

          {/* Course Selection */}
          {form.state.values.termId && (
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
                                  const newIds = [...selectedCourses, course.id]

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

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={
                form.state.isSubmitting ||
                enrollCoursesMutation.isPending ||
                !form.state.values.termId ||
                form.state.values.courseIds.length === 0
              }
              type="submit"
            >
              {form.state.isSubmitting || enrollCoursesMutation.isPending
                ? 'Adding Courses...'
                : 'Add Courses'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
