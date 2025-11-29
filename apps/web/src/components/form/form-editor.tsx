'use client'

import type { QuestionType } from '@rov/shared'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Tabs, TabsList, TabsTrigger } from '@rov/ui/components/tabs'
import { Textarea } from '@rov/ui/components/textarea'
import { FolderPlus, Plus, Settings, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfigurationPanel } from './configuration-panel'
import type { FormData, Page, Question } from './form-builder'
import { PageSettings } from './page-settings'
import { QuestionCard } from './question-card'
import { QuestionTypeSelector } from './question-type-selector'

interface FormEditorProps {
  formData: FormData
  setFormData: (data: FormData) => void
  selectedQuestionId: string | null
  setSelectedQuestionId: (id: string | null) => void
}

export function FormEditor({
  formData,
  setFormData,
  selectedQuestionId,
  setSelectedQuestionId
}: FormEditorProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [activePage, setActivePage] = useState(formData.pages[0]?.id || '')
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null) // Added state for page settings

  const updateFormTitle = (title: string) => {
    setFormData({ ...formData, title })
  }

  const updateFormDescription = (description: string) => {
    setFormData({ ...formData, description })
  }

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      title: 'Untitled Question',
      required: false,
      options:
        type === 'multiple-choice' ||
        type === 'checkboxes' ||
        type === 'dropdown'
          ? ['Option 1']
          : undefined,
      pageId: activePage,
      order: formData.questions.filter((q) => q.pageId === activePage).length,
      conditionalLogicEnabled: false,
      enableAutoFill: false,
      enableBidirectionalSync: false
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    })
    setSelectedQuestionId(newQuestion.id)
    setShowTypeSelector(false)
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      )
    })
  }

  const deleteQuestion = (id: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== id)
    })
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null)
    }
  }

  const duplicateQuestion = (id: string) => {
    const question = formData.questions.find((q) => q.id === id)
    if (question) {
      const newQuestion = {
        ...question,
        id: `q-${Date.now()}`,
        title: `${question.title} (Copy)`
      }
      setFormData({
        ...formData,
        questions: [...formData.questions, newQuestion]
      })
    }
  }

  const addPage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: `Page ${formData.pages.length + 1}`,
      order: formData.pages.length,
      conditionalLogicEnabled: false
    }
    setFormData({
      ...formData,
      pages: [...formData.pages, newPage]
    })
    setActivePage(newPage.id)
  }

  const deletePage = (pageId: string) => {
    if (formData.pages.length <= 1) return
    const newPages = formData.pages.filter((p) => p.id !== pageId)
    const _questionsOnPage = formData.questions.filter(
      (q) => q.pageId === pageId
    )
    const updatedQuestions = formData.questions.map((q) =>
      q.pageId === pageId ? { ...q, pageId: newPages[0].id } : q
    )
    setFormData({
      ...formData,
      pages: newPages,
      questions: updatedQuestions
    })
    if (activePage === pageId) {
      setActivePage(newPages[0].id)
    }
  }

  const updatePageTitle = (pageId: string, title: string) => {
    setFormData({
      ...formData,
      pages: formData.pages.map((p) => (p.id === pageId ? { ...p, title } : p))
    })
  }

  const updatePage = (pageId: string, updates: Partial<Page>) => {
    setFormData({
      ...formData,
      pages: formData.pages.map((p) =>
        p.id === pageId ? { ...p, ...updates } : p
      )
    })
  }

  const selectedQuestion = formData.questions.find(
    (q) => q.id === selectedQuestionId
  )
  const pageQuestions = formData.questions.filter(
    (q) => q.pageId === activePage
  )
  const activPageData = formData.pages.find((p) => p.id === activePage)
  const selectedPage = formData.pages.find((p) => p.id === selectedPageId)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {/* Form Header */}
        <Card className="space-y-4 p-6">
          <Input
            className="border-0 px-0 font-semibold text-2xl focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => updateFormTitle(e.target.value)}
            placeholder="Form Title"
            value={formData.title}
          />
          <Textarea
            className="resize-none border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => updateFormDescription(e.target.value)}
            placeholder="Form description"
            rows={2}
            value={formData.description}
          />
        </Card>

        {formData.pages.length > 1 && (
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium text-sm">Form Pages</p>
              <div className="flex gap-2">
                {activePage && (
                  <Button
                    onClick={() => setSelectedPageId(activePage)}
                    size="sm"
                    variant="ghost"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Page Settings
                  </Button>
                )}
                <Button onClick={addPage} size="sm" variant="outline">
                  <FolderPlus className="mr-1 h-3 w-3" />
                  Add Page
                </Button>
              </div>
            </div>
            <Tabs onValueChange={setActivePage} value={activePage}>
              <TabsList className="h-auto w-full flex-wrap justify-start">
                {formData.pages.map((page) => (
                  <TabsTrigger
                    className="group relative pr-8"
                    key={page.id}
                    value={page.id}
                  >
                    <Input
                      className="h-6 w-24 border-0 bg-transparent px-2 focus-visible:ring-1"
                      onChange={(e) => {
                        e.stopPropagation()
                        updatePageTitle(page.id, e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      value={page.title}
                    />
                    {formData.pages.length > 1 && (
                      <button
                        className="-translate-y-1/2 absolute top-1/2 right-1 opacity-0 hover:text-destructive group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePage(page.id)
                        }}
                        type="button"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Card>
        )}

        {formData.pages.length === 1 && (
          <Button
            className="w-full"
            onClick={addPage}
            size="sm"
            variant="ghost"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Add Page Break
          </Button>
        )}

        {activPageData?.description && (
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">
              {activPageData.description}
            </p>
          </Card>
        )}

        {pageQuestions.map((question, _index) => (
          <QuestionCard
            isSelected={selectedQuestionId === question.id}
            key={question.id}
            onDelete={() => deleteQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
            onSelect={() => {
              setSelectedQuestionId(question.id)
              setSelectedPageId(null) // Clear page selection when selecting question
            }}
            onUpdate={(updates) => updateQuestion(question.id, updates)}
            question={question}
          />
        ))}

        {/* Add Question Button */}
        {showTypeSelector ? (
          <QuestionTypeSelector
            onCancel={() => setShowTypeSelector(false)}
            onSelect={addQuestion}
          />
        ) : (
          <Button
            className="h-16 w-full border-dashed bg-transparent"
            onClick={() => setShowTypeSelector(true)}
            variant="outline"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Question
          </Button>
        )}
      </div>

      {/* Configuration Panel */}
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
        {selectedPage && (
          <PageSettings
            allPages={formData.pages}
            allQuestions={formData.questions}
            onClose={() => setSelectedPageId(null)}
            onUpdate={(updates) => updatePage(selectedPage.id, updates)}
            page={selectedPage}
          />
        )}
        {!selectedPage && selectedQuestion && (
          <ConfigurationPanel
            allQuestions={formData.questions}
            onClose={() => setSelectedQuestionId(null)}
            onUpdate={(updates) => updateQuestion(selectedQuestion.id, updates)}
            question={selectedQuestion}
          />
        )}
        {!(selectedPage || selectedQuestion) && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground text-sm">
              Select a question or page to configure its settings
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
