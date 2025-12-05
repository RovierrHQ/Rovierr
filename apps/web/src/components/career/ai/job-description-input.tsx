'use client'

import type { ExtendedParsedJobData } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface JobDescriptionInputProps {
  onJobParsed: (jobData: ExtendedParsedJobData) => void
  onError: (error: string) => void
}

export function JobDescriptionInput({
  onJobParsed,
  onError
}: JobDescriptionInputProps) {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('text')
  const [urlValue, setUrlValue] = useState('')
  const [textValue, setTextValue] = useState('')

  // Parse job description from text
  const parseTextMutation = useMutation(
    orpc.career.ai.parseJobDescription.mutationOptions({
      onSuccess: (data) => {
        toast.success('Job description parsed successfully')
        onJobParsed(data)
        onError('')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to parse job description')
        onError(error.message)
      }
    })
  )

  // Parse job description from URL
  const parseUrlMutation = useMutation(
    orpc.career.ai.parseJobUrl.mutationOptions({
      onSuccess: (data) => {
        toast.success('Job URL parsed successfully')
        onJobParsed(data)
        onError('')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to parse job URL')
        onError(error.message)
      }
    })
  )

  const handleParse = () => {
    onError('') // Clear previous errors

    if (inputMode === 'url') {
      if (!urlValue.trim()) {
        onError('Please enter a job URL')
        return
      }
      parseUrlMutation.mutate({ url: urlValue })
    } else {
      if (!textValue.trim()) {
        onError('Please enter a job description')
        return
      }

      if (textValue.length > 10_000) {
        onError('Job description is too long (max 10,000 characters)')
        return
      }

      parseTextMutation.mutate({ text: textValue })
    }
  }

  const isParsing = parseTextMutation.isPending || parseUrlMutation.isPending

  const charCount = textValue.length
  const charLimit = 10_000

  return (
    <div className="space-y-4">
      <Tabs
        onValueChange={(v) => setInputMode(v as 'url' | 'text')}
        value={inputMode}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Paste Text</TabsTrigger>
          <TabsTrigger value="url">From URL</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="text">
          <div className="space-y-2">
            <Label htmlFor="job-text">Job Description</Label>
            <Textarea
              className="resize-none"
              id="job-text"
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Paste the job description here..."
              rows={12}
              value={textValue}
            />
            <div className="flex justify-between text-muted-foreground text-sm">
              <span>
                Paste the full job posting including requirements and
                responsibilities
              </span>
              <span className={charCount > charLimit ? 'text-destructive' : ''}>
                {charCount.toLocaleString()} / {charLimit.toLocaleString()}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="url">
          <div className="space-y-2">
            <Label htmlFor="job-url">Job Posting URL</Label>
            <Input
              id="job-url"
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://linkedin.com/jobs/..."
              type="url"
              value={urlValue}
            />
            <p className="text-muted-foreground text-sm">
              Enter the URL of the job posting (LinkedIn, Indeed, company
              website, etc.)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        className="w-full"
        disabled={
          isParsing ||
          (inputMode === 'url' ? !urlValue.trim() : !textValue.trim())
        }
        onClick={handleParse}
      >
        {isParsing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Parsing Job Description...
          </>
        ) : (
          'Parse Job Description'
        )}
      </Button>
    </div>
  )
}
