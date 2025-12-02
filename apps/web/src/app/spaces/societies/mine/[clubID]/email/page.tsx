'use client'

import type { PreviewEmailResponse } from '@rov/orpc-contracts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { History, Mail } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmailComposer } from '@/components/societies/email-composer'
import { EmailDetailsModal } from '@/components/societies/email-details-modal'
import { EmailHistory } from '@/components/societies/email-history'
import { EmailPreviewModal } from '@/components/societies/email-preview-modal'
import { orpc } from '@/utils/orpc'

export default function EmailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const clubID = params.clubID as string

  const [currentPage, setCurrentPage] = useState(0)
  const [previewData, setPreviewData] = useState<PreviewEmailResponse | null>(
    null
  )
  const [showPreview, setShowPreview] = useState(false)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Get organization details
  const { data: organization } = useQuery(
    orpc.society.getById.queryOptions({ input: { id: clubID } })
  )

  // Get member count - using a simple count query
  const memberCount = organization?.memberCount || 0

  // Get email history
  const { data: emailHistory, isLoading: isLoadingHistory } = useQuery(
    orpc.societyEmail.list.queryOptions({
      input: {
        organizationId: clubID,
        limit: 50,
        offset: currentPage * 50
      }
    })
  )

  // Get email details when selected
  const { data: emailDetails, isLoading: isLoadingDetails } = useQuery({
    ...orpc.societyEmail.get.queryOptions({
      input: { emailId: selectedEmailId || '' }
    }),
    enabled: !!selectedEmailId && showDetails
  })

  // Send email mutation
  const sendMutation = useMutation(
    orpc.societyEmail.send.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `Email sent successfully to ${data.recipientCount} members!`
        )
        // Invalidate all email list queries to refresh the history
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === 'orpc' &&
            query.queryKey[1] === 'societyEmail.list'
        })
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to send email')
      }
    })
  )

  // Preview email mutation
  const previewMutation = useMutation(
    orpc.societyEmail.preview.mutationOptions({
      onSuccess: (data) => {
        setPreviewData(data)
        setShowPreview(true)
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to generate preview')
      }
    })
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
                organizationName={organization.name}
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
