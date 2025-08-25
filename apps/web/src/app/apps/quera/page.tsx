'use client'

import {
  Close as DialogClose,
  Content as DialogContent,
  Overlay as DialogOverlay,
  Portal as DialogPortal,
  Root as DialogRoot
} from '@radix-ui/react-dialog'
import type { Question, Quiz } from '@rov/shared'
import { QuizSchema } from '@rov/shared'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '@rov/ui/components/card'
import { DialogTitle } from '@rov/ui/components/dialog'
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
  Eye,
  ListChecks,
  Plus,
  Settings as SettingsIcon,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { getHostState, saveQuiz, setHostState } from '@/lib/quera-store'

type TabKey = 'settings' | 'questions' | 'preview'

function QueraPage() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('questions')
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
      prompt: '',
      explanation: undefined as string | undefined
    }
    let q: Question
    switch (type) {
      case 'mcq':
        q = {
          ...base,
          type: 'mcq',
          choices: [
            { id: `${id}-a`, text: '' },
            { id: `${id}-b`, text: '' }
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
            { id: `${id}-a`, text: '' },
            { id: `${id}-b`, text: '' }
          ],
          correctChoiceIds: [],
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
          correctAnswers: [''],
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
    setActiveTab('questions')
  }

  const updateQuestion = (id: string, updater: (q: Question) => Question) => {
    setQuiz((qz) => ({
      ...qz,
      questions: qz.questions.map((qq) => (qq.id === id ? updater(qq) : qq))
    }))
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
    alert(`Saved. Share link: ${location.origin}/apps/quera/play/${quiz.id}`)
    setOpen(false)
  }

  const selectedQ = selectedQuestionId
    ? (quiz.questions.find((qq) => qq.id === selectedQuestionId) ?? null)
    : (quiz.questions[0] ?? null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-3xl">Quera</h1>
          <p className="text-muted-foreground">
            Live quizzes, polls, and forms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" /> New Quiz
          </Button>
        </div>
      </div>

      <Card className="border-white/10">
        <CardContent className="space-y-3 p-6">
          <CardTitle className="text-xl">
            {quiz.title || 'Untitled Quiz'}
          </CardTitle>
          <CardDescription>
            {quiz.questions.length} question
            {quiz.questions.length === 1 ? '' : 's'} · navigation:{' '}
            {quiz.settings.navigationMode}
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/apps/quera/build">
              <Button variant="secondary">Edit</Button>
            </Link>
            <Link href={`/apps/quera/play/${quiz.id}`}>
              <Button variant="outline">Preview</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <DialogRoot onOpenChange={setOpen} open={open}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/40 data-[state=closed]:animate-out data-[state=open]:animate-in" />
          <DialogContent className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[1120px] flex-col border-white/10 border-l bg-background p-0 shadow-2xl data-[state=closed]:animate-out data-[state=open]:animate-in">
            <DialogTitle className="sr-only">Edit Quiz</DialogTitle>
            <div className="flex items-center justify-between border-white/10 border-b p-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setActiveTab('settings')}
                  size="sm"
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                >
                  <SettingsIcon className="mr-2 size-4" /> Settings
                </Button>
                <Button
                  onClick={() => setActiveTab('questions')}
                  size="sm"
                  variant={activeTab === 'questions' ? 'default' : 'ghost'}
                >
                  <ListChecks className="mr-2 size-4" /> Questions
                </Button>
                <Button
                  onClick={() => setActiveTab('preview')}
                  size="sm"
                  variant={activeTab === 'preview' ? 'default' : 'ghost'}
                >
                  <Eye className="mr-2 size-4" /> Preview
                </Button>
              </div>
              <DialogClose asChild>
                <Button aria-label="Close" size="icon" variant="ghost">
                  <X className="size-5" />
                </Button>
              </DialogClose>
            </div>

            <SidebarProvider>
              <Sidebar
                className="hidden h-svh border-r lg:flex"
                collapsible="none"
                side="left"
              >
                <SidebarHeader className="h-16 border-white/10 border-b">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">Questions</div>
                    <Button
                      onClick={() => addQuestion('mcq')}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="mr-1 size-4" /> Add
                    </Button>
                  </div>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarMenu>
                    {quiz.questions.map((q) => (
                      <SidebarMenuItem key={q.id}>
                        <SidebarMenuButton
                          isActive={selectedQ?.id === q.id}
                          onClick={() => {
                            setSelectedQuestionId(q.id)
                            setActiveTab('questions')
                          }}
                        >
                          <span className="text-xs uppercase">{q.type}</span>
                          <span className="text-muted-foreground">
                            {q.prompt || 'Untitled'}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarContent>
                <SidebarSeparator />
                <div className="p-2">
                  <Button
                    className="w-full"
                    onClick={() => addQuestion('mcq')}
                    size="sm"
                    variant="outline"
                  >
                    + New Question
                  </Button>
                </div>
              </Sidebar>

              <SidebarInset>
                <header className="sticky top-0 flex h-12 shrink-0 items-center gap-2 bg-background px-3">
                  <SidebarTrigger />
                  <div className="text-muted-foreground text-sm">
                    {quiz.title}
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  {activeTab === 'preview' && (
                    <pre className="whitespace-pre-wrap rounded bg-white/5 p-4 text-xs">
                      {JSON.stringify(quiz, null, 2)}
                    </pre>
                  )}
                  {activeTab === 'settings' && (
                    <div className="grid gap-4 sm:grid-cols-2">
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
                        <label className="text-sm" htmlFor="default-points">
                          Default points
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
                      <div className="space-y-2">
                        <label className="text-sm" htmlFor="default-time">
                          Default time (s)
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
                        <label className="text-sm" htmlFor="nav-mode">
                          Navigation mode
                        </label>
                        <select
                          className="w-full rounded-md border border-white/10 bg-transparent p-2"
                          id="nav-mode"
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
                          <option value="auto">Auto</option>
                          <option value="host">Host</option>
                        </select>
                      </div>
                    </div>
                  )}
                  {activeTab === 'questions' && selectedQ && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label
                          className="text-sm"
                          htmlFor={`prompt-${selectedQ.id}`}
                        >
                          Prompt
                        </label>
                        <Input
                          id={`prompt-${selectedQ.id}`}
                          onChange={(e) =>
                            updateQuestion(selectedQ.id, (old) => ({
                              ...old,
                              prompt: e.target.value
                            }))
                          }
                          value={selectedQ.prompt}
                        />
                      </div>
                      <QuestionEditor
                        q={selectedQ}
                        update={(updater) =>
                          updateQuestion(selectedQ.id, updater)
                        }
                      />
                    </div>
                  )}
                  {activeTab === 'questions' && !selectedQ && (
                    <div className="text-muted-foreground text-sm">
                      No question selected.
                    </div>
                  )}
                </div>
              </SidebarInset>

              <Sidebar
                className="hidden h-svh border-l lg:flex"
                collapsible="none"
                side="right"
              >
                <SidebarHeader className="h-16 border-white/10 border-b">
                  <div className="font-medium text-sm">Question Settings</div>
                </SidebarHeader>
                <SidebarContent>
                  {selectedQ ? (
                    <div className="space-y-3 p-2">
                      <div>
                        <label
                          className="text-sm"
                          htmlFor={`ovt-${selectedQ.id}`}
                        >
                          Override time (s)
                        </label>
                        <Input
                          id={`ovt-${selectedQ.id}`}
                          onChange={(e) =>
                            updateQuestion(selectedQ.id, (old) => ({
                              ...old,
                              timeLimitSeconds:
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
                            }))
                          }
                          type="number"
                          value={selectedQ.timeLimitSeconds ?? ''}
                        />
                      </div>
                      <div>
                        <label
                          className="text-sm"
                          htmlFor={`ovp-${selectedQ.id}`}
                        >
                          Override points
                        </label>
                        <Input
                          id={`ovp-${selectedQ.id}`}
                          onChange={(e) =>
                            updateQuestion(selectedQ.id, (old) => ({
                              ...old,
                              points:
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
                            }))
                          }
                          type="number"
                          value={selectedQ.points ?? ''}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 text-muted-foreground text-sm">
                      Select a question to edit settings.
                    </div>
                  )}
                </SidebarContent>
              </Sidebar>
            </SidebarProvider>

            <div className="flex items-center justify-between border-white/10 border-t p-4">
              <div className="text-muted-foreground text-xs">
                Share: /apps/quera/play/{quiz.id}
              </div>
              <div className="flex items-center gap-2">
                {quiz.settings.navigationMode === 'host' ? (
                  <>
                    <Button
                      onClick={() =>
                        setHostState({
                          quizId: quiz.id,
                          status: 'live',
                          currentIndex: Math.max(
                            0,
                            (getHostState(quiz.id)?.currentIndex ?? 0) - 1
                          ),
                          startedAt: new Date().toISOString()
                        })
                      }
                      size="sm"
                      variant="outline"
                    >
                      Prev
                    </Button>
                    <Button
                      onClick={() =>
                        setHostState({
                          quizId: quiz.id,
                          status: 'live',
                          currentIndex: Math.min(
                            quiz.questions.length - 1,
                            (getHostState(quiz.id)?.currentIndex ?? 0) + 1
                          ),
                          startedAt: new Date().toISOString()
                        })
                      }
                      size="sm"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </>
                ) : null}
                <Button onClick={() => setOpen(false)} variant="ghost">
                  Cancel
                </Button>
                <Button onClick={onSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
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
    <div className="space-y-2">
      {q.choices.map((c) => (
        <div className="flex items-center gap-2" key={`${q.id}-${c.id}`}>
          <input
            aria-label={`correct-${c.id}`}
            checked={q.correctChoiceId === c.id}
            onChange={() =>
              update((old) =>
                old.type === 'mcq' ? { ...old, correctChoiceId: c.id } : old
              )
            }
            type="radio"
          />
          <Input
            onChange={(e) =>
              update((old) =>
                old.type === 'mcq'
                  ? {
                      ...old,
                      choices: old.choices.map((cc) =>
                        cc.id === c.id ? { ...cc, text: e.target.value } : cc
                      )
                    }
                  : old
              )
            }
            value={c.text}
          />
        </div>
      ))}
      <Button onClick={addChoice} size="sm" variant="outline">
        Add option
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
    <div className="space-y-2">
      {q.choices.map((c) => (
        <div className="flex items-center gap-2" key={`${q.id}-${c.id}`}>
          <input
            checked={q.correctChoiceIds.includes(c.id)}
            onChange={(e) => toggle(c.id, e.target.checked)}
            type="checkbox"
          />
          <Input
            onChange={(e) =>
              update((old) =>
                old.type === 'multi_select'
                  ? {
                      ...old,
                      choices: old.choices.map((cc) =>
                        cc.id === c.id ? { ...cc, text: e.target.value } : cc
                      )
                    }
                  : old
              )
            }
            value={c.text}
          />
        </div>
      ))}
      <Button onClick={addChoice} size="sm" variant="outline">
        Add option
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
    <div className="flex items-center gap-4">
      <label
        className="flex items-center gap-2 text-sm"
        htmlFor={`tf-true-${q.id}`}
      >
        <input
          checked={q.correct === true}
          id={`tf-true-${q.id}`}
          onChange={() =>
            update((old) =>
              old.type === 'true_false' ? { ...old, correct: true } : old
            )
          }
          type="radio"
        />{' '}
        True
      </label>
      <label
        className="flex items-center gap-2 text-sm"
        htmlFor={`tf-false-${q.id}`}
      >
        <input
          checked={q.correct === false}
          id={`tf-false-${q.id}`}
          onChange={() =>
            update((old) =>
              old.type === 'true_false' ? { ...old, correct: false } : old
            )
          }
          type="radio"
        />{' '}
        False
      </label>
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
    <div className="space-y-2">
      {q.correctAnswers.map((a) => (
        <Input
          key={`${q.id}-${a}`}
          onChange={(e) =>
            update((old) => {
              if (old.type !== 'input') return old
              const arr = old.correctAnswers.map((aa) =>
                aa === a ? e.target.value : aa
              )
              return { ...old, correctAnswers: arr }
            })
          }
          value={a}
        />
      ))}
      <Button onClick={addAnswer} size="sm" variant="outline">
        Add accepted answer
      </Button>
    </div>
  )
}

export default QueraPage
