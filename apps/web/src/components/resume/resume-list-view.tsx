'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@rov/ui/components/alert-dialog'
import { Button } from '@rov/ui/components/button'
import { DataTable } from '@rov/ui/components/data-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { columns } from './resume-table-columns'

export default function ResumeListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<{
    id: string
    title: string
  } | null>(null)

  // Fetch resumes using ORPC
  const { data } = useQuery(
    orpc.resume.list.queryOptions({
      input: {
        limit: 50,
        offset: 0
      }
    })
  )

  // Create resume mutation
  const createMutation = useMutation(
    orpc.resume.create.mutationOptions({
      onSuccess: (result) => {
        queryClient.invalidateQueries({
          queryKey: orpc.resume.list.queryKey({
            input: { limit: 50, offset: 0 }
          })
        })
        router.push(`/spaces/career/resume-builder/${result.id}`)
        toast.success('Resume created successfully')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create resume')
      }
    })
  )

  // Delete resume mutation
  const deleteMutation = useMutation(
    orpc.resume.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.resume.list.queryKey({
            input: { limit: 50, offset: 0 }
          })
        })
        toast.success('Resume deleted successfully')
        setDeleteDialogOpen(false)
        setResumeToDelete(null)
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete resume')
      }
    })
  )

  const handleCreateResume = () => {
    createMutation.mutate({
      title: 'Untitled Resume',
      targetPosition: '',
      templateId: 'default'
    })
  }

  const handleDeleteClick = (resume: { id: string; title: string }) => {
    setResumeToDelete(resume)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (resumeToDelete) {
      deleteMutation.mutate({ id: resumeToDelete.id })
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="font-bold text-2xl">Resume Builder</h1>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="mt-4 font-semibold">My resumes</p>
        <Button
          className="mt-4"
          disabled={createMutation.isPending}
          onClick={handleCreateResume}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Resume'}
          <Plus className="ml-2" size={18} strokeWidth={1.5} />
        </Button>
      </div>

      <DataTable
        columns={[
          ...columns.slice(0, -1), // All columns except the actions placeholder
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Button
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick({
                    id: row.original.id,
                    title: row.original.title
                  })
                }}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )
          }
        ]}
        data={(data?.resumes || []).map((resume) => ({
          ...resume,
          appliedSuggestions: resume.appliedSuggestions || []
        }))}
        EmptyView={
          <EmptyView
            isCreating={createMutation.isPending}
            onCreateResume={handleCreateResume}
          />
        }
        onRowClick={(row) => {
          router.push(`/spaces/career/resume-builder/${row.id}`)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resumeToDelete?.title}"? This
              action cannot be undone.
              {data?.resumes?.find((r) => r.id === resumeToDelete?.id)
                ?.sourceResumeId && (
                <span className="mt-2 block text-yellow-600">
                  Note: This is an AI-optimized version. The original resume
                  will not be affected.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const EmptyView = ({
  onCreateResume,
  isCreating
}: {
  onCreateResume: () => void
  isCreating: boolean
}) => {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center">
      <strong>Kickstart Building Your Resume</strong>
      <p>Quickly create your resume to enhance chance of getting a job.</p>
      <Button className="mt-4" disabled={isCreating} onClick={onCreateResume}>
        {isCreating ? 'Creating...' : 'Create Resume'}
        <Plus className="ml-2" size={18} strokeWidth={1.5} />
      </Button>
    </div>
  )
}
