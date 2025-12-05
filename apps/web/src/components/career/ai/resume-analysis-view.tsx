'use client'

import type { ResumeAnalysis } from '@rov/orpc-contracts'
import { Badge } from '@rov/ui/components/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Progress } from '@rov/ui/components/progress'
import { CheckCircle2, TrendingUp, XCircle } from 'lucide-react'

interface ResumeAnalysisViewProps {
  analysis: ResumeAnalysis
}

export function ResumeAnalysisView({ analysis }: ResumeAnalysisViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Match Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Match Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${getScoreBgColor(analysis.matchScore)}`}
            >
              <span
                className={`font-bold text-2xl ${getScoreColor(analysis.matchScore)}`}
              >
                {analysis.matchScore}
              </span>
            </div>
            <div className="flex-1">
              <Progress className="h-3" value={analysis.matchScore} />
              <p className="mt-2 text-muted-foreground text-sm">
                {analysis.matchScore >= 80
                  ? 'Excellent match! Your resume aligns well with the job requirements.'
                  : analysis.matchScore >= 60
                    ? 'Good match. Some improvements could strengthen your application.'
                    : 'Consider optimizing your resume to better match this position.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li className="flex items-start gap-2" key={index}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No specific strengths identified.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.gaps.length > 0 ? (
            <ul className="space-y-2">
              {analysis.gaps.map((gap, index) => (
                <li className="flex items-start gap-2" key={index}>
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  <span className="text-sm">{gap}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No gaps identified.</p>
          )}
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium text-sm">Found Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keywordMatches.found.length > 0 ? (
                analysis.keywordMatches.found.map((keyword, index) => (
                  <Badge
                    className="bg-green-100 text-green-800"
                    key={index}
                    variant="default"
                  >
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No matching keywords found.
                </p>
              )}
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-sm">Missing Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keywordMatches.missing.length > 0 ? (
                analysis.keywordMatches.missing.map((keyword, index) => (
                  <Badge
                    className="border-red-300 text-red-800"
                    key={index}
                    variant="outline"
                  >
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  All key keywords are present.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Section-by-Section Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analysis.sectionScores).map(([section, data]) => (
            <div className="space-y-2" key={section}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm capitalize">
                  {section}
                </span>
                <span
                  className={`font-semibold text-sm ${getScoreColor(data.score)}`}
                >
                  {data.score}/100
                </span>
              </div>
              <Progress className="h-2" value={data.score} />
              <p className="text-muted-foreground text-sm">{data.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{analysis.overallFeedback}</p>
        </CardContent>
      </Card>
    </div>
  )
}
