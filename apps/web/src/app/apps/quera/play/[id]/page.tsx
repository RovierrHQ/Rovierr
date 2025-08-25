'use client'

import type { Question, Quiz, QuizSettings } from '@rov/shared'
import { getEffectiveQuestionConfig } from '@rov/shared'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getHostState,
  getLeaderboard,
  loadQuiz,
  makeId,
  onStorage,
  upsertLeaderboard
} from '@/lib/quera-store'

type Props = {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}

const normalize = (
  s: string,
  trim: boolean,
  normalizeWs: boolean,
  caseSensitive: boolean
) => {
  let v = s
  if (trim) v = v.trim()
  if (normalizeWs) v = v.replace(/\s+/g, ' ')
  if (!caseSensitive) v = v.toLowerCase()
  return v
}

const isCorrect = (q: Question, answer: unknown): boolean => {
  switch (q.type) {
    case 'mcq':
      return answer === q.correctChoiceId
    case 'multi_select': {
      const set = new Set(q.correctChoiceIds)
      const ans = new Set((answer as string[]) || [])
      if (set.size !== ans.size) return false
      for (const id of set) if (!ans.has(id)) return false
      return true
    }
    case 'true_false':
      return answer === q.correct
    case 'input': {
      const cfg = q.validation
      const target = normalize(
        String(answer || ''),
        cfg.trimWhitespace,
        cfg.normalizeWhitespace,
        cfg.caseSensitive
      )
      return q.correctAnswers.some(
        (a) =>
          normalize(
            a,
            cfg.trimWhitespace,
            cfg.normalizeWhitespace,
            cfg.caseSensitive
          ) === target
      )
    }
    default:
      return false
  }
}

const computeScore = (
  correct: boolean,
  startedAt: number,
  answeredAt: number,
  settings: QuizSettings
) => {
  if (!correct) return 0
  const base = settings.defaultPoints
  const early = settings.earlyAnswerScoring
  if (!early.enabled) return base
  const elapsed = (answeredAt - startedAt) / 1000
  if (early.mode === 'fixed') {
    return elapsed <= early.windowSeconds
      ? Math.round(base * (1 + early.maxBonusPercent / 100))
      : base
  }
  // linear decay from 0..windowSeconds
  const t = Math.max(0, Math.min(early.windowSeconds, elapsed))
  const factor =
    1 +
    ((early.windowSeconds - t) / early.windowSeconds) *
      (early.maxBonusPercent / 100)
  return Math.round(base * factor)
}

export default function Page({ params }: Props) {
  const quiz = useMemo<Quiz | null>(() => loadQuiz(params.id), [params.id])
  const [name, setName] = useState('')
  const [userId] = useState(() => `u_${makeId(10)}`)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<unknown>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const startRef = useRef<number>(0)

  const settings = quiz?.settings
  const q = quiz?.questions[index]

  // follow host navigation if available
  useEffect(() => {
    if (!quiz) return
    const state = getHostState(quiz.id)
    if (state && quiz.settings.navigationMode === 'host') {
      setIndex(state.currentIndex)
    }
    return onStorage((key) => {
      if (!quiz) return
      if (key === `quera.host.${quiz.id}`) {
        const s = getHostState(quiz.id)
        if (s && quiz.settings.navigationMode === 'host')
          setIndex(s.currentIndex)
      }
    })
  }, [quiz])

  // setup timer for the current question
  useEffect(() => {
    if (!q) return
    if (!settings) return
    const cfg = getEffectiveQuestionConfig(q, settings)
    setTimeLeft(cfg.timeLimitSeconds)
    startRef.current = Date.now()
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [q, settings])

  if (!quiz) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card className="border-white/10">
          <CardContent className="space-y-3 p-6">
            <CardTitle>Quiz not found</CardTitle>
            <CardDescription>
              <Link className="underline" href="/apps/quera">
                Back
              </Link>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  const startOrNext = () => {
    if (index < quiz.questions.length - 1) {
      setIndex((i) => i + 1)
      setAnswer(null)
    }
  }

  const submit = () => {
    if (!q) return
    const correct = isCorrect(q, answer)
    const cfg = getEffectiveQuestionConfig(q, quiz.settings)
    const score = computeScore(correct, startRef.current, Date.now(), {
      ...quiz.settings,
      // use effective points when overridden
      defaultPoints: cfg.points
    })
    upsertLeaderboard(quiz.id, {
      userId,
      name: name || 'Anonymous',
      score,
      lastAnswerAt: new Date().toISOString()
    })
    if (quiz.settings.navigationMode === 'auto') startOrNext()
  }

  const leaderboard = getLeaderboard(quiz.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl">{quiz.title}</h1>
          <p className="text-muted-foreground">
            Question {index + 1} / {quiz.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            value={name}
          />
          <Button onClick={submit}>Submit</Button>
        </div>
      </div>

      {q ? (
        <Card className="border-white/10">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="font-medium text-lg">
                {q.prompt || 'Untitled'}
              </div>
              <div className="text-sm">{timeLeft}s</div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded bg-white/10">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(() => {
                    const limit =
                      getEffectiveQuestionConfig(q, quiz.settings)
                        .timeLimitSeconds || 1
                    const pct = (timeLeft / limit) * 100
                    return Math.min(100, Math.max(0, pct))
                  })()}%`
                }}
              />
            </div>

            <QuestionUI answer={answer} q={q} setAnswer={setAnswer} />
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-8">
        <Card className="border-white/10">
          <CardContent className="space-y-3 p-6">
            <CardTitle>Leaderboard</CardTitle>
            <ol className="space-y-2 text-sm">
              {leaderboard.map((e, i) => (
                <li
                  className="flex items-center justify-between"
                  key={e.userId}
                >
                  <span className="text-muted-foreground">
                    {i + 1}. {e.name}
                  </span>
                  <span className="font-medium">{e.score}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuestionUI({
  q,
  answer,
  setAnswer
}: {
  q: Question
  answer: unknown
  setAnswer: (v: unknown) => void
}) {
  if (q.type === 'mcq') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {q.choices.map((c) => (
          <label
            className="flex cursor-pointer items-center gap-2 rounded border border-white/10 p-2"
            key={c.id}
          >
            <input
              checked={answer === c.id}
              onChange={() => setAnswer(c.id)}
              type="radio"
            />
            <span>{c.text || 'Option'}</span>
          </label>
        ))}
      </div>
    )
  }
  if (q.type === 'multi_select') {
    const set = new Set((answer as string[]) || [])
    const toggle = (id: string) => {
      const next = new Set(set)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setAnswer(Array.from(next))
    }
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {q.choices.map((c) => (
          <label
            className="flex cursor-pointer items-center gap-2 rounded border border-white/10 p-2"
            key={c.id}
          >
            <input
              checked={set.has(c.id)}
              onChange={() => toggle(c.id)}
              type="checkbox"
            />
            <span>{c.text || 'Option'}</span>
          </label>
        ))}
      </div>
    )
  }
  if (q.type === 'true_false') {
    return (
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={answer === true}
            onChange={() => setAnswer(true)}
            type="radio"
          />{' '}
          True
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={answer === false}
            onChange={() => setAnswer(false)}
            type="radio"
          />{' '}
          False
        </label>
      </div>
    )
  }
  // input
  return (
    <Input
      onChange={(e) => setAnswer(e.target.value)}
      placeholder="Your answer"
      value={String(answer ?? '')}
    />
  )
}
