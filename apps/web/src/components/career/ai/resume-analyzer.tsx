'use client'

import type {
  ExtendedParsedJobData,
  ResumeAnalysis,
  ResumeSuggestion
} from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Brain, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { ResumeAnalysisView } from './resume-analysis-view'
import { SuggestionsList } from './suggestions-list'

interface ResumeAnalyzerProps {
  resumeId: string
  jobData: ExtendedParsedJobData
  jobApplicationId: string
  onOptimizedResumeCreated?: (newResumeId: string) => void
  analysis: ResumeAnalysis | null
  suggestions: ResumeSuggestion[]
  onAnalysisComplete: (
    analysis: ResumeAnalysis,
    suggestions: ResumeSuggestion[]
  ) => void
}

export function ResumeAnalyzer({
  resumeId,
  jobData,
  jobApplicationId,
  onOptimizedResumeCreated,
  analysis,
  suggestions,
  onAnalysisComplete
}: ResumeAnalyzerProps) {
  // Analyze resume mutation
  const analyzeMutation = useMutation(
    orpc.career.ai.analyzeResume.mutationOptions({
      onSuccess: (data) => {
        onAnalysisComplete(data.analysis, data.suggestions)
        toast.success('Resume analysis completed')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to analyze resume')
      }
    })
  )

  const handleAnalyze = () => {
    analyzeMutation.mutate({
      resumeId,
      jobApplicationId,
      jobData
    })
  }

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      {!analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Resume Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Analyze your resume against this job posting to get personalized
                suggestions for improvement.
              </p>
              <Button
                className="w-full sm:w-auto"
                disabled={analyzeMutation.isPending}
                onClick={handleAnalyze}
                size="lg"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {analyzeMutation.isPending && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <h3 className="mb-2 font-medium text-lg">Analyzing Your Resume</h3>
            <p className="text-center text-muted-foreground text-sm">
              Our AI is comparing your resume against the job requirements...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {analyzeMutation.isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="mb-4 h-8 w-8 text-destructive" />
            <h3 className="mb-2 font-medium text-lg">Analysis Failed</h3>
            <p className="mb-4 text-center text-muted-foreground text-sm">
              {analyzeMutation.error?.message ||
                'Something went wrong during analysis'}
            </p>
            <Button onClick={handleAnalyze} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          <ResumeAnalysisView analysis={analysis} />
          {suggestions.length > 0 && (
            <SuggestionsList
              jobApplicationId={jobApplicationId}
              onOptimizedResumeCreated={onOptimizedResumeCreated}
              sourceResumeId={resumeId}
              suggestions={suggestions}
            />
          )}
        </>
      )}
    </div>
  )
}
