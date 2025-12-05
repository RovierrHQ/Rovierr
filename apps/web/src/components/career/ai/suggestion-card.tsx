'use client'

import type { ResumeSuggestion } from '@rov/orpc-contracts'
import { Badge } from '@rov/ui/components/badge'
import { Card, CardContent } from '@rov/ui/components/card'
import { Checkbox } from '@rov/ui/components/checkbox'
import { ArrowRight, Sparkles } from 'lucide-react'

interface SuggestionCardProps {
  suggestion: ResumeSuggestion
  isSelected: boolean
  onToggle: () => void
}

export function SuggestionCard({
  suggestion,
  isSelected,
  onToggle
}: SuggestionCardProps) {
  const getImpactColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800'
    if (score >= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <Card className={isSelected ? 'border-primary' : ''}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                className="mt-1"
                id={`suggestion-${suggestion.id}`}
                onCheckedChange={onToggle}
              />
              <div className="space-y-1">
                <label
                  className="cursor-pointer font-medium text-sm"
                  htmlFor={`suggestion-${suggestion.id}`}
                >
                  {suggestion.field}
                </label>
                <p className="text-muted-foreground text-xs">
                  {suggestion.reasoning}
                </p>
              </div>
            </div>
            <Badge className={getImpactColor(suggestion.impactScore)}>
              Impact: {suggestion.impactScore}/10
            </Badge>
          </div>

          {/* Before/After Content */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground text-xs">
                  CURRENT
                </span>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="whitespace-pre-wrap text-sm">
                  {suggestion.originalContent}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:hidden">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="font-medium text-primary text-xs">
                  SUGGESTED
                </span>
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="whitespace-pre-wrap text-sm">
                  {suggestion.proposedContent}
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {suggestion.keywords.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium text-muted-foreground text-xs">
                KEYWORDS ADDED:
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestion.keywords.map((keyword, index) => (
                  <Badge className="text-xs" key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
