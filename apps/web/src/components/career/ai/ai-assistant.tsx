'use client'

import type {
  CoverLetter,
  ExtendedParsedJobData,
  ResumeAnalysis,
  ResumeSuggestion
} from '@rov/orpc-contracts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { Brain, FileText, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { CoverLetterGenerator } from './cover-letter-generator'
import { JobDescriptionInput } from './job-description-input'
import { ResumeAnalyzer } from './resume-analyzer'

interface AIAssistantProps {
  resumeId: string
  jobApplicationId?: string
  initialJobData?: ExtendedParsedJobData
}

export function AIAssistant({
  resumeId,
  jobApplicationId,
  initialJobData
}: AIAssistantProps) {
  const [jobData, setJobData] = useState<ExtendedParsedJobData | null>(
    initialJobData || null
  )
  const [activeTab, setActiveTab] = useState('job-input')
  const [error, setError] = useState('')

  // Lift state up to persist across tab changes
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>([])
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null)
  const [coverLetterContent, setCoverLetterContent] = useState('')

  const handleJobParsed = (parsedJobData: ExtendedParsedJobData) => {
    setJobData(parsedJobData)
    setActiveTab('analyze')
  }

  const handleOptimizedResumeCreated = (_newResumeId: string) => {
    // In a real app, you might want to navigate to the new resume or show a success message
  }

  const handleAnalysisComplete = (
    newAnalysis: ResumeAnalysis,
    newSuggestions: ResumeSuggestion[]
  ) => {
    setAnalysis(newAnalysis)
    setSuggestions(newSuggestions)
  }

  const handleCoverLetterGenerated = (newCoverLetter: CoverLetter) => {
    setCoverLetter(newCoverLetter)
    setCoverLetterContent(newCoverLetter.content)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Resume & Cover Letter Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use AI to analyze job postings, optimize your resume, and generate
            personalized cover letters.
          </p>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="flex items-center gap-2" value="job-input">
            <FileText className="h-4 w-4" />
            Job Description
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2"
            disabled={!jobData}
            value="analyze"
          >
            <Brain className="h-4 w-4" />
            Analyze Resume
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2"
            disabled={!jobData}
            value="cover-letter"
          >
            <FileText className="h-4 w-4" />
            Cover Letter
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="job-input">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <JobDescriptionInput
                onError={setError}
                onJobParsed={handleJobParsed}
              />
              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Data Preview */}
          {jobData && (
            <Card>
              <CardHeader>
                <CardTitle>Parsed Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium">Company</h4>
                    <p className="text-muted-foreground text-sm">
                      {jobData.companyName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Position</h4>
                    <p className="text-muted-foreground text-sm">
                      {jobData.positionTitle}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-muted-foreground text-sm">
                      {jobData.location || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Experience</h4>
                    <p className="text-muted-foreground text-sm">
                      {jobData.experienceYears
                        ? `${jobData.experienceYears} years`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Key Skills</h4>
                  <p className="text-muted-foreground text-sm">
                    {jobData.skills.slice(0, 10).join(', ')}
                    {jobData.skills.length > 10 && '...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent className="space-y-6" value="analyze">
          {jobData && jobApplicationId && (
            <ResumeAnalyzer
              analysis={analysis}
              jobApplicationId={jobApplicationId}
              jobData={jobData}
              onAnalysisComplete={handleAnalysisComplete}
              onOptimizedResumeCreated={handleOptimizedResumeCreated}
              resumeId={resumeId}
              suggestions={suggestions}
            />
          )}
        </TabsContent>

        <TabsContent className="space-y-6" value="cover-letter">
          {jobData && (
            <CoverLetterGenerator
              applicationId={jobApplicationId}
              coverLetter={coverLetter}
              coverLetterContent={coverLetterContent}
              jobData={jobData}
              onContentChange={setCoverLetterContent}
              onCoverLetterGenerated={handleCoverLetterGenerated}
              resumeId={resumeId}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
