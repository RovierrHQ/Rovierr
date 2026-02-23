import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'

type PreviewEmailResponse = {
  previewSubject: string
  previewHtml: string
  sampleData: {
    user: {
      name: string
      email: string
      username: string | null
    }
    organization: {
      name: string
    }
  }
}

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { EmailComposer } from '@web/components/societies/email-composer'
import { EmailDetailsModal } from '@web/components/societies/email-details-modal'
import { EmailHistory } from '@web/components/societies/email-history'
import { EmailPreviewModal } from '@web/components/societies/email-preview-modal'
import api, { useMutation, useQuery } from '@web/lib/api-client'
import { History, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/spaces/societies/mine/$clubID/email')({
  component: EmailPage
})

function EmailPage() {
  const params = useParams({ from: '/spaces/societies/mine/$clubID/email' })
  const queryClient = useQueryClient()
  const clubID = params.clubID

  const [currentPage, setCurrentPage] = useState(0)
  const [previewData, setPreviewData] = useState<PreviewEmailResponse | null>(
    null
  )
  const [showPreview, setShowPreview] = useState(false)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Get organization details
  const { data: organization } = useQuery({
    queryKey: ['society', 'getById', { id: clubID }],
    queryFn: async () => {
      const response = await api.society({ id: clubID }).get()
      return response.data
    }
  })

  // Get member count - using a simple count query
  const memberCount = organization?.memberCount || 0

  // Get email history
  const { data: emailHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: [
      'societyEmail',
      'list',
      { organizationId: clubID, limit: 50, offset: currentPage * 50 }
    ],
    queryFn: () =>
      api.society.email.list.get({
        query: {
          organizationId: clubID,
          limit: 50,
          offset: currentPage * 50
        }
      })
  })

  // Get email details when selected
  const { data: emailDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['societyEmail', 'get', { emailId: selectedEmailId }],
    queryFn: () =>
      api.society.email(selectedEmailId || '').get({
        params: { emailId: selectedEmailId || '' }
      }),
    enabled: !!selectedEmailId && showDetails
  })

  // Send email mutation
  const sendMutation = useMutation(
    (data: {
      organizationId: string
      subject: string
      bodyHtml: string
      bodyText: string
    }) => api.society.email.send.post(data),
    {
      onSuccess: (data) => {
        if (!data) return
        toast.success(
          `Email sent successfully to ${data.recipientCount} members!`
        )
        // Invalidate all email list queries to refresh the history
        queryClient.invalidateQueries({
          queryKey: ['societyEmail', 'list']
        })
      },
      onError: (error) => {
        toast.error(error.value?.message || 'Failed to send email')
      }
    }
  )

  // Preview email mutation
  const previewMutation = useMutation(
    (data: { organizationId: string; subject: string; bodyHtml: string }) =>
      api.society.email.preview.post(data),
    {
      onSuccess: (data) => {
        if (!data) return
        setPreviewData(data)
        setShowPreview(true)
      },
      onError: (error) => {
        toast.error(error.value?.message || 'Failed to generate preview')
      }
    }
  )

  const handleSend = async (data: {
    subject: string
    bodyHtml: string
    bodyText: string
  }) => {
    await sendMutation.mutateAsync({
      organizationId: clubID,
      ...data
    })
  }

  const handlePreview = (data: { subject: string; bodyHtml: string }) => {
    previewMutation.mutate({
      organizationId: clubID,
      ...data
    })
  }

  const handleViewDetails = (emailId: string) => {
    setSelectedEmailId(emailId)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedEmailId(null)
  }

  if (!organization) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Society Emails</h1>
        <p className="mt-2 text-muted-foreground">
          Send announcements and updates to all {organization.name} members
        </p>
      </div>

      <Tabs className="space-y-6" defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">
            <Mail className="mr-2 h-4 w-4" />
            Compose Email
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Email History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Email</CardTitle>
              <CardDescription>
                Create and send an email to all society members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailComposer
                isSending={Boolean(sendMutation.isPending)}
                memberCount={memberCount}
                onPreview={handlePreview}
                onSend={handleSend}
                organizationId={clubID}
                organizationName={organization?.name || ''}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>
                View all emails sent to society members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailHistory
                currentPage={currentPage}
                emails={emailHistory?.emails || []}
                hasMore={Boolean(emailHistory?.hasMore)}
                isLoading={isLoadingHistory}
                onPageChange={setCurrentPage}
                onViewDetails={handleViewDetails}
                total={emailHistory?.total || 0}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewData && (
        <EmailPreviewModal
          bodyHtml={previewData.previewHtml}
          onClose={() => setShowPreview(false)}
          open={showPreview}
          sampleData={previewData.sampleData}
          subject={previewData.previewSubject}
        />
      )}

      {/* Email Details Modal */}
      <EmailDetailsModal
        email={emailDetails || null}
        isLoading={isLoadingDetails}
        onClose={handleCloseDetails}
        open={showDetails}
      />
    </div>
  )
}
