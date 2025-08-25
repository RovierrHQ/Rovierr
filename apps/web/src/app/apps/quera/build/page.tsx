'use client'

import type { Question, Quiz } from '@rov/shared'
import { QuizSchema } from '@rov/shared'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger
} from '@rov/ui/components/sidebar'
import {
  CheckCircle,
  CheckSquare,
  Circle,
  Plus,
  Save,
  Settings,
  Type,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { saveQuiz } from '@/lib/quera-store'

function QuizBuilderPage() {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  )
  const [quiz, setQuiz] = useState<Quiz>(() => ({
    id: `quiz-${Date.now()}`,
    title: 'Untitled Quiz',
    description: '',
    settings: {
      defaultTimeLimitSeconds: 10,
      defaultPoints: 100,
      earlyAnswerScoring: {
        enabled: false,
        mode: 'linear',
        maxBonusPercent: 0,
        windowSeconds: 10
      },
      navigationMode: 'auto',
      access: { mode: 'rolling', durationSeconds: 600 },
      leaderboard: { enabled: true },
      allowQuestionOverride: true
    },
    questions: [],
    tags: [],
    version: '1'
  }))

  const addQuestion = (type: Question['type']) => {
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const base = {
      id,
      prompt: `${type.toUpperCase()} Question`,
      explanation: undefined as string | undefined
    }
    let q: Question
    switch (type) {
      case 'mcq':
        q = {
          ...base,
          type: 'mcq',
          choices: [
            { id: `${id}-a`, text: 'Option A' },
            { id: `${id}-b`, text: 'Option B' },
            { id: `${id}-c`, text: 'Option C' },
            { id: `${id}-d`, text: 'Option D' }
          ],
          correctChoiceId: `${id}-a`,
          shuffleChoices: true
        }
        break
      case 'multi_select':
        q = {
          ...base,
          type: 'multi_select',
          choices: [
            { id: `${id}-a`, text: 'Option A' },
            { id: `${id}-b`, text: 'Option B' },
            { id: `${id}-c`, text: 'Option C' }
          ],
          correctChoiceIds: [`${id}-a`],
          shuffleChoices: true
        }
        break
      case 'true_false':
        q = { ...base, type: 'true_false', correct: true }
        break
      default:
        q = {
          ...base,
          type: 'input',
          correctAnswers: ['answer'],
          validation: {
            caseSensitive: false,
            trimWhitespace: true,
            normalizeWhitespace: true
          }
        }
        break
    }
    setQuiz((qz) => ({ ...qz, questions: [...qz.questions, q] }))
    setSelectedQuestionId(id)
  }

  const updateQuestion = (id: string, updater: (q: Question) => Question) => {
    setQuiz((qz) => ({
      ...qz,
      questions: qz.questions.map((qq) => (qq.id === id ? updater(qq) : qq))
    }))
  }

  const removeQuestion = (id: string) => {
    setQuiz((qz) => ({
      ...qz,
      questions: qz.questions.filter((qq) => qq.id !== id)
    }))
    if (selectedQuestionId === id) {
      setSelectedQuestionId(quiz.questions[0]?.id || null)
    }
  }

  const onSave = () => {
    const res = QuizSchema.safeParse(quiz)
    if (!res.success) {
      // eslint-disable-next-line no-alert
      alert('Fix validation errors before saving.')
      return
    }
    saveQuiz(quiz)
    // eslint-disable-next-line no-alert
    alert(`Saved! Share link: ${location.origin}/apps/quera/play/${quiz.id}`)
  }

  const selectedQ = selectedQuestionId
    ? (quiz.questions.find((qq) => qq.id === selectedQuestionId) ?? null)
    : null

  return (
    <div className="h-screen">
      <SidebarProvider>
        {/* Left Sidebar - Questions List */}
        <Sidebar
          className="hidden h-svh border-r lg:flex"
          collapsible="none"
          side="left"
        >
          <SidebarHeader className="h-16 border-white/10 border-b">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">Questions</div>
              <Link href="/apps/quera">
                <Button size="sm" variant="ghost">
                  <X className="size-4" />
                </Button>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {quiz.questions.map((q, index) => (
                <SidebarMenuItem key={q.id}>
                  <SidebarMenuButton
                    isActive={selectedQ?.id === q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                  >
                    <div className="flex items-center gap-2">
                      {q.type === 'mcq' && <Circle className="size-4" />}
                      {q.type === 'multi_select' && (
                        <CheckSquare className="size-4" />
                      )}
                      {q.type === 'true_false' && (
                        <CheckCircle className="size-4" />
                      )}
                      {q.type === 'input' && <Type className="size-4" />}
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          Q{index + 1}
                        </span>
                        <span className="text-muted-foreground text-xs uppercase">
                          {q.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeQuestion(q.id)
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="size-3" />
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarSeparator />
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="flex h-auto flex-col gap-1 p-3"
                onClick={() => addQuestion('mcq')}
                size="sm"
                variant="outline"
              >
                <Circle className="size-4" />
                <span className="text-xs">MCQ</span>
              </Button>
              <Button
                className="flex h-auto flex-col gap-1 p-3"
                onClick={() => addQuestion('multi_select')}
                size="sm"
                variant="outline"
              >
                <CheckSquare className="size-4" />
                <span className="text-xs">Multi</span>
              </Button>
              <Button
                className="flex h-auto flex-col gap-1 p-3"
                onClick={() => addQuestion('true_false')}
                size="sm"
                variant="outline"
              >
                <CheckCircle className="size-4" />
                <span className="text-xs">T/F</span>
              </Button>
              <Button
                className="flex h-auto flex-col gap-1 p-3"
                onClick={() => addQuestion('input')}
                size="sm"
                variant="outline"
              >
                <Type className="size-4" />
                <span className="text-xs">Input</span>
              </Button>
            </div>
          </div>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="font-semibold text-lg">{quiz.title}</h1>
                <p className="text-muted-foreground text-sm">
                  {quiz.questions.length} questions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onSave} size="sm">
                  <Save className="mr-2 size-4" />
                  Save
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6">
            {selectedQ ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {selectedQ.type === 'mcq' && (
                        <Circle className="size-5" />
                      )}
                      {selectedQ.type === 'multi_select' && (
                        <CheckSquare className="size-5" />
                      )}
                      {selectedQ.type === 'true_false' && (
                        <CheckCircle className="size-5" />
                      )}
                      {selectedQ.type === 'input' && (
                        <Type className="size-5" />
                      )}
                      Question Editor
                    </CardTitle>
                    <span className="text-muted-foreground text-sm uppercase">
                      {selectedQ.type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-medium text-sm" htmlFor="prompt">
                      Question Prompt
                    </label>
                    <Input
                      id="prompt"
                      onChange={(e) =>
                        updateQuestion(selectedQ.id, (old) => ({
                          ...old,
                          prompt: e.target.value
                        }))
                      }
                      placeholder="Enter your question..."
                      value={selectedQ.prompt}
                    />
                  </div>

                  <QuestionEditor
                    q={selectedQ}
                    update={(updater) => updateQuestion(selectedQ.id, updater)}
                  />

                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                      <label
                        className="font-medium text-sm"
                        htmlFor="time-override"
                      >
                        Time Limit (seconds)
                      </label>
                      <Input
                        id="time-override"
                        onChange={(e) =>
                          updateQuestion(selectedQ.id, (old) => ({
                            ...old,
                            timeLimitSeconds:
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                          }))
                        }
                        placeholder="Default: 10s"
                        type="number"
                        value={selectedQ.timeLimitSeconds ?? ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="font-medium text-sm"
                        htmlFor="points-override"
                      >
                        Points
                      </label>
                      <Input
                        id="points-override"
                        onChange={(e) =>
                          updateQuestion(selectedQ.id, (old) => ({
                            ...old,
                            points:
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                          }))
                        }
                        placeholder="Default: 100"
                        type="number"
                        value={selectedQ.points ?? ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <div className="space-y-4">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                    <Plus className="size-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">
                      No question selected
                    </h3>
                    <p className="text-muted-foreground">
                      Add a question from the sidebar or select an existing one
                      to start editing.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>

        {/* Right Sidebar - Quiz Settings */}
        <Sidebar
          className="hidden h-svh border-l lg:flex"
          collapsible="none"
          side="right"
        >
          <SidebarHeader className="h-16 border-white/10 border-b">
            <div className="flex items-center gap-2">
              <Settings className="size-4" />
              <div className="font-medium text-sm">Quiz Settings</div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Basic Info</h4>
                <div className="space-y-2">
                  <label className="text-sm" htmlFor="quiz-title">
                    Title
                  </label>
                  <Input
                    id="quiz-title"
                    onChange={(e) =>
                      setQuiz({ ...quiz, title: e.target.value })
                    }
                    value={quiz.title}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" htmlFor="quiz-description">
                    Description
                  </label>
                  <Input
                    id="quiz-description"
                    onChange={(e) =>
                      setQuiz({ ...quiz, description: e.target.value })
                    }
                    placeholder="Optional description..."
                    value={quiz.description}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Defaults</h4>
                <div className="space-y-2">
                  <label className="text-sm" htmlFor="default-time">
                    Time per question (s)
                  </label>
                  <Input
                    id="default-time"
                    onChange={(e) =>
                      setQuiz({
                        ...quiz,
                        settings: {
                          ...quiz.settings,
                          defaultTimeLimitSeconds: Number(e.target.value)
                        }
                      })
                    }
                    type="number"
                    value={quiz.settings.defaultTimeLimitSeconds}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" htmlFor="default-points">
                    Points per question
                  </label>
                  <Input
                    id="default-points"
                    onChange={(e) =>
                      setQuiz({
                        ...quiz,
                        settings: {
                          ...quiz.settings,
                          defaultPoints: Number(e.target.value)
                        }
                      })
                    }
                    type="number"
                    value={quiz.settings.defaultPoints}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Navigation</h4>
                <select
                  className="w-full rounded-md border border-white/10 bg-background p-2 text-sm"
                  onChange={(e) =>
                    setQuiz({
                      ...quiz,
                      settings: {
                        ...quiz.settings,
                        navigationMode: e.target
                          .value as Quiz['settings']['navigationMode']
                      }
                    })
                  }
                  value={quiz.settings.navigationMode}
                >
                  <option value="auto">Auto advance</option>
                  <option value="host">Host controlled</option>
                </select>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}

function QuestionEditor({
  q,
  update
}: {
  q: Question
  update: (updater: (q: Question) => Question) => void
}) {
  switch (q.type) {
    case 'mcq':
      return <McqEditor q={q} update={update} />
    case 'multi_select':
      return <MultiSelectEditor q={q} update={update} />
    case 'true_false':
      return <TrueFalseEditor q={q} update={update} />
    case 'input':
      return <InputEditor q={q} update={update} />
    default:
      return null
  }
}

function McqEditor({
  q,
  update
}: {
  q: Extract<Question, { type: 'mcq' }>
  update: (u: (q: Question) => Question) => void
}) {
  const addChoice = () => {
    const id = `${q.id}-${Math.random().toString(36).slice(2, 6)}`
    update((old) => {
      if (old.type !== 'mcq') return old
      return { ...old, choices: [...old.choices, { id, text: '' }] }
    })
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Answer Choices</h4>
      <div className="space-y-3">
        {q.choices.map((c, index) => (
          <div className="flex items-center gap-3" key={c.id}>
            <input
              checked={q.correctChoiceId === c.id}
              onChange={() =>
                update((old) =>
                  old.type === 'mcq' ? { ...old, correctChoiceId: c.id } : old
                )
              }
              type="radio"
            />
            <div className="flex-1">
              <Input
                onChange={(e) =>
                  update((old) =>
                    old.type === 'mcq'
                      ? {
                          ...old,
                          choices: old.choices.map((cc) =>
                            cc.id === c.id
                              ? { ...cc, text: e.target.value }
                              : cc
                          )
                        }
                      : old
                  )
                }
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={c.text}
              />
            </div>
            <Button
              onClick={() =>
                update((old) =>
                  old.type === 'mcq'
                    ? {
                        ...old,
                        choices: old.choices.filter((cc) => cc.id !== c.id)
                      }
                    : old
                )
              }
              size="sm"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={addChoice} size="sm" variant="outline">
        <Plus className="mr-2 size-4" />
        Add Choice
      </Button>
    </div>
  )
}

function MultiSelectEditor({
  q,
  update
}: {
  q: Extract<Question, { type: 'multi_select' }>
  update: (u: (q: Question) => Question) => void
}) {
  const addChoice = () => {
    const id = `${q.id}-${Math.random().toString(36).slice(2, 6)}`
    update((old) => {
      if (old.type !== 'multi_select') return old
      return { ...old, choices: [...old.choices, { id, text: '' }] }
    })
  }

  const toggle = (id: string, checked: boolean) =>
    update((old) => {
      if (old.type !== 'multi_select') return old
      const set = new Set(old.correctChoiceIds)
      if (checked) set.add(id)
      else set.delete(id)
      return { ...old, correctChoiceIds: Array.from(set) }
    })

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Answer Choices (Multiple Correct)</h4>
      <div className="space-y-3">
        {q.choices.map((c, index) => (
          <div className="flex items-center gap-3" key={c.id}>
            <input
              checked={q.correctChoiceIds.includes(c.id)}
              onChange={(e) => toggle(c.id, e.target.checked)}
              type="checkbox"
            />
            <div className="flex-1">
              <Input
                onChange={(e) =>
                  update((old) =>
                    old.type === 'multi_select'
                      ? {
                          ...old,
                          choices: old.choices.map((cc) =>
                            cc.id === c.id
                              ? { ...cc, text: e.target.value }
                              : cc
                          )
                        }
                      : old
                  )
                }
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={c.text}
              />
            </div>
            <Button
              onClick={() =>
                update((old) =>
                  old.type === 'multi_select'
                    ? {
                        ...old,
                        choices: old.choices.filter((cc) => cc.id !== c.id)
                      }
                    : old
                )
              }
              size="sm"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={addChoice} size="sm" variant="outline">
        <Plus className="mr-2 size-4" />
        Add Choice
      </Button>
    </div>
  )
}

function TrueFalseEditor({
  q,
  update
}: {
  q: Extract<Question, { type: 'true_false' }>
  update: (u: (q: Question) => Question) => void
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Correct Answer</h4>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            checked={q.correct === true}
            onChange={() =>
              update((old) =>
                old.type === 'true_false' ? { ...old, correct: true } : old
              )
            }
            type="radio"
          />
          <span>True</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={q.correct === false}
            onChange={() =>
              update((old) =>
                old.type === 'true_false' ? { ...old, correct: false } : old
              )
            }
            type="radio"
          />
          <span>False</span>
        </label>
      </div>
    </div>
  )
}

function InputEditor({
  q,
  update
}: {
  q: Extract<Question, { type: 'input' }>
  update: (u: (q: Question) => Question) => void
}) {
  const addAnswer = () =>
    update((old) =>
      old.type === 'input'
        ? { ...old, correctAnswers: [...old.correctAnswers, ''] }
        : old
    )

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Correct Answers</h4>
      <div className="space-y-3">
        {q.correctAnswers.map((answer, index) => (
          <div
            className="flex items-center gap-3"
            key={`${q.id}-answer-${index}`}
          >
            <div className="flex-1">
              <Input
                onChange={(e) =>
                  update((old) => {
                    if (old.type !== 'input') return old
                    const newAnswers = [...old.correctAnswers]
                    newAnswers[index] = e.target.value
                    return { ...old, correctAnswers: newAnswers }
                  })
                }
                placeholder="Enter acceptable answer..."
                value={answer}
              />
            </div>
            <Button
              onClick={() =>
                update((old) =>
                  old.type === 'input'
                    ? {
                        ...old,
                        correctAnswers: old.correctAnswers.filter(
                          (_, i) => i !== index
                        )
                      }
                    : old
                )
              }
              size="sm"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={addAnswer} size="sm" variant="outline">
        <Plus className="mr-2 size-4" />
        Add Answer
      </Button>
    </div>
  )
}

export default QuizBuilderPage
