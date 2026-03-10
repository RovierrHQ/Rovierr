import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useQuery as useTanstackQuery } from '@tanstack/react-query'

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

import { Tabs, TabsContent } from '@rov/ui/components/tabs'
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

// Summary Card Component
function SummaryCard({
  title,
  value,
  icon: Icon,
  isActive,
  onClick,
  variant = 'default'
}: {
  title: string
  value: string
  icon: React.ElementType
  isActive?: boolean
  onClick?: () => void
  variant?: 'default' | 'warning' | 'success'
}) {
  const variantStyles = {
    default: 'bg-card hover:bg-accent',
    warning:
      'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    success:
      'bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800'
  }

  const iconColors = {
    default: 'text-primary',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-green-600 dark:text-green-400'
  }

  return (
    <button
      className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${variantStyles[variant]} ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={`rounded-full p-2 ${variant === 'default' ? 'bg-primary/10' : variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}
        >
          <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
        </div>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{title}</p>
    </button>
  )
}

function EmailPage() {
  const params = useParams({ from: '/spaces/societies/mine/$clubID/email' })
  const queryClient = useQueryClient()
  const clubID = params.clubID

  const [currentPage, setCurrentPage] = useState(0)
  const [activeTab, setActiveTab] = useState('compose')
  const [previewData, setPreviewData] = useState<PreviewEmailResponse | null>(
    null
  )
  const [showPreview, setShowPreview] = useState(false)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Get organization details
  const { data: organization } = useTanstackQuery({
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
    queryFn: () => api.society.email({ emailId: selectedEmailId || '' }).get(),
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

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={Mail}
          isActive={activeTab === 'compose'}
          onClick={() => setActiveTab('compose')}
          title="Compose Email"
          value="Send"
        />
        <SummaryCard
          icon={History}
          isActive={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          title="Email History"
          value={emailHistory?.total?.toString() || '0'}
        />
      </div>

      <Tabs
        className="space-y-6"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsContent className="mt-0" value="compose">
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

        <TabsContent className="mt-0" value="history">
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
