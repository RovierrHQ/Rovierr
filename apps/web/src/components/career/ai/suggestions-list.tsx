'use client'

import type { ResumeSuggestion } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { CheckSquare, Square } from 'lucide-react'
import { useState } from 'react'
import { ApplySuggestionsDialog } from './apply-suggestions-dialog'
import { SuggestionCard } from './suggestion-card'

interface SuggestionsListProps {
  suggestions: ResumeSuggestion[]
  sourceResumeId: string
  jobApplicationId: string
  onOptimizedResumeCreated?: (newResumeId: string) => void
}

export function SuggestionsList({
  suggestions,
  sourceResumeId,
  jobApplicationId,
  onOptimizedResumeCreated
}: SuggestionsListProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  )
  const [showApplyDialog, setShowApplyDialog] = useState(false)

  const toggleSuggestion = (id: string) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedSuggestions(newSelected)
  }

  const handleApply = () => {
    setShowApplyDialog(true)
  }

  const selectAll = () => {
    setSelectedSuggestions(new Set(suggestions.map((s) => s.id)))
  }

  const deselectAll = () => {
    setSelectedSuggestions(new Set())
  }

  // Group suggestions by section
  const groupedSuggestions = suggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.section]) {
        acc[suggestion.section] = []
      }
      acc[suggestion.section].push(suggestion)
      return acc
    },
    {} as Record<string, ResumeSuggestion[]>
  )

  // Sort sections by priority
  const sectionOrder = [
    'basicInfo',
    'experience',
    'projects',
    'education',
    'certifications'
  ]
  const sortedSections = Object.keys(groupedSuggestions).sort(
    (a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Suggestions ({suggestions.length})</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <Button
                  className="flex items-center gap-2"
                  onClick={selectAll}
                  size="sm"
                  variant="outline"
                >
                  <CheckSquare className="h-4 w-4" />
                  Select All
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={deselectAll}
                  size="sm"
                  variant="outline"
                >
                  <Square className="h-4 w-4" />
                  Deselect All
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm">
                  {selectedSuggestions.size} of {suggestions.length} selected
                </span>
                <Button
                  className="flex items-center gap-2"
                  disabled={selectedSuggestions.size === 0}
                  onClick={handleApply}
                >
                  Apply Selected ({selectedSuggestions.size})
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Review and select suggestions to apply to your resume. A new
            optimized version will be created.
          </p>
        </CardContent>
      </Card>

      {sortedSections.map((section) => (
        <div className="space-y-3" key={section}>
          <h3 className="font-semibold text-lg capitalize">
            {section === 'basicInfo' ? 'Basic Information' : section}
          </h3>
          <div className="space-y-3">
            {groupedSuggestions[section]
              .sort((a, b) => b.impactScore - a.impactScore)
              .map((suggestion) => (
                <SuggestionCard
                  isSelected={selectedSuggestions.has(suggestion.id)}
                  key={suggestion.id}
                  onToggle={() => toggleSuggestion(suggestion.id)}
                  suggestion={suggestion}
                />
              ))}
          </div>
        </div>
      ))}

      {/* Apply Suggestions Dialog */}
      <ApplySuggestionsDialog
        jobApplicationId={jobApplicationId}
        onOpenChange={setShowApplyDialog}
        onSuccess={(newResumeId) => {
          setSelectedSuggestions(new Set())
          if (onOptimizedResumeCreated) {
            onOptimizedResumeCreated(newResumeId)
          }
        }}
        open={showApplyDialog}
        selectedSuggestions={Array.from(selectedSuggestions)}
        sourceResumeId={sourceResumeId}
      />
    </div>
  )
}
