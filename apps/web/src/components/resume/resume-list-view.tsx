'use client'

import { Button } from '@rov/ui/components/button'
import { DataTable } from '@rov/ui/components/data-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { columns } from './resume-table-columns'

export default function ResumeListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

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

  const handleCreateResume = () => {
    createMutation.mutate({
      title: 'Untitled Resume',
      targetPosition: '',
      templateId: 'default'
    })
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
        columns={columns}
        data={data?.resumes || []}
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
