'use client'

import type { Quiz } from '@rov/shared'

const QUIZ_KEY_PREFIX = 'quera.quiz.'
const HOST_STATE_PREFIX = 'quera.host.'
const LEADERBOARD_PREFIX = 'quera.leaderboard.'

export type HostState = {
  quizId: string
  status: 'idle' | 'live' | 'ended'
  currentIndex: number
  startedAt: string | null
}

export type LeaderboardEntry = {
  userId: string
  name: string
  score: number
  lastAnswerAt: string
}

export const makeId = (len = 8) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => (b % 36).toString(36))
    .join('')

export const getQuizKey = (id: string) => `${QUIZ_KEY_PREFIX}${id}`
export const getHostKey = (id: string) => `${HOST_STATE_PREFIX}${id}`
export const getLeaderboardKey = (id: string) => `${LEADERBOARD_PREFIX}${id}`

export const saveQuiz = (quiz: Quiz) => {
  localStorage.setItem(getQuizKey(quiz.id), JSON.stringify(quiz))
}

export const loadQuiz = (id: string): Quiz | null => {
  const raw = localStorage.getItem(getQuizKey(id))
  return raw ? (JSON.parse(raw) as Quiz) : null
}

export const listQuizzes = (): Array<{ id: string; title: string }> => {
  const items: Array<{ id: string; title: string }> = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith(QUIZ_KEY_PREFIX)) {
      try {
        const quiz = JSON.parse(
          localStorage.getItem(key) || 'null'
        ) as Quiz | null
        if (quiz) items.push({ id: quiz.id, title: quiz.title })
      } catch {
        // ignore
      }
    }
  }
  return items
}

export const setHostState = (state: HostState) => {
  localStorage.setItem(getHostKey(state.quizId), JSON.stringify(state))
}

export const getHostState = (quizId: string): HostState | null => {
  const raw = localStorage.getItem(getHostKey(quizId))
  return raw ? (JSON.parse(raw) as HostState) : null
}

export const upsertLeaderboard = (quizId: string, entry: LeaderboardEntry) => {
  const key = getLeaderboardKey(quizId)
  const raw = localStorage.getItem(key)
  const list: LeaderboardEntry[] = raw
    ? (JSON.parse(raw) as LeaderboardEntry[])
    : []
  const idx = list.findIndex((e) => e.userId === entry.userId)
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      name: entry.name || list[idx].name,
      score: list[idx].score + entry.score,
      lastAnswerAt: entry.lastAnswerAt
    }
  } else {
    list.push(entry)
  }
  localStorage.setItem(key, JSON.stringify(list))
}

export const getLeaderboard = (quizId: string): LeaderboardEntry[] => {
  const key = getLeaderboardKey(quizId)
  const raw = localStorage.getItem(key)
  const list: LeaderboardEntry[] = raw
    ? (JSON.parse(raw) as LeaderboardEntry[])
    : []
  return list.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : a.lastAnswerAt.localeCompare(b.lastAnswerAt)
  )
}

export const onStorage = (
  handler: (
    key: string | null,
    newValue: string | null,
    oldValue: string | null
  ) => void
) => {
  const listener = (e: StorageEvent) => handler(e.key, e.newValue, e.oldValue)
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}
