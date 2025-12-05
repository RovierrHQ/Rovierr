'use client'

import type { CoverLetter, ExtendedParsedJobData } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation } from '@tanstack/react-query'
import { Download, FileText, Loader2, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface CoverLetterGeneratorProps {
  resumeId: string
  jobData: ExtendedParsedJobData
  applicationId?: string
  coverLetter: CoverLetter | null
  coverLetterContent: string
  onCoverLetterGenerated: (coverLetter: CoverLetter) => void
  onContentChange: (content: string) => void
}

export function CoverLetterGenerator({
  resumeId,
  jobData,
  applicationId,
  coverLetter,
  coverLetterContent,
  onCoverLetterGenerated,
  onContentChange
}: CoverLetterGeneratorProps) {
  // Generate cover letter mutation
  const generateMutation = useMutation(
    orpc.career.ai.generateCoverLetter.mutationOptions({
      onSuccess: (data) => {
        onCoverLetterGenerated(data)
        toast.success('Cover letter generated successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to generate cover letter')
      }
    })
  )

  // Update cover letter mutation
  const updateMutation = useMutation(
    orpc.career.ai.updateCoverLetter.mutationOptions({
      onSuccess: (data) => {
        onCoverLetterGenerated(data)
        toast.success('Cover letter saved successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to save cover letter')
      }
    })
  )

  const handleGenerate = () => {
    generateMutation.mutate({
      resumeId,
      jobData,
      applicationId
    })
  }

  const handleRegenerate = () => {
    if (
      window.confirm('This will replace your current cover letter. Continue?')
    ) {
      handleGenerate()
    }
  }

  const handleSave = () => {
    if (!coverLetter) return

    updateMutation.mutate({
      id: coverLetter.id,
      content: coverLetterContent.trim()
    })
  }

  const handleExportPDF = () => {
    // Create a simple text file for now - in production, you'd use a PDF library
    const blob = new Blob([coverLetterContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${jobData.companyName}-${jobData.positionTitle}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Cover letter exported')
  }

  const charCount = coverLetterContent.length

  return (
    <div className="space-y-6">
      {/* Generate Cover Letter */}
      {!coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              AI Cover Letter Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Generate a personalized cover letter based on your resume and
                this job posting.
              </p>
              <Button
                className="w-full sm:w-auto"
                disabled={generateMutation.isPending}
                onClick={handleGenerate}
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Cover Letter...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter Editor */}
      {coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cover Letter
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={generateMutation.isPending}
                  onClick={handleRegenerate}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Regenerate
                </Button>
                <Button
                  disabled={!coverLetterContent.trim()}
                  onClick={handleExportPDF}
                  size="sm"
                  variant="outline"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
                <Button
                  disabled={
                    updateMutation.isPending || !coverLetterContent.trim()
                  }
                  onClick={handleSave}
                  size="sm"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="resize-none font-mono text-sm"
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Your cover letter will appear here..."
              rows={20}
              value={coverLetterContent}
            />
            <div className="flex justify-between text-muted-foreground text-sm">
              <span>
                Edit the generated cover letter to add your personal touch
              </span>
              <span>{charCount.toLocaleString()} characters</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {generateMutation.isPending && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <h3 className="mb-2 font-medium text-lg">
              Generating Cover Letter
            </h3>
            <p className="text-center text-muted-foreground text-sm">
              Our AI is crafting a personalized cover letter based on your
              resume and the job requirements...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
