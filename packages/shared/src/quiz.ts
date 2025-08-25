import { z } from 'zod'

// Choice item used by MCQ and Multi-Select
export const ChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1)
})
export type Choice = z.infer<typeof ChoiceSchema>

// Per-question override scoring settings
export const EarlyAnswerScoringSchema = z.object({
  enabled: z.boolean().default(false),
  mode: z.enum(['linear', 'fixed']).default('linear'),
  // Percentage bonus at t=0 (earliest answer). 0-100
  maxBonusPercent: z.number().min(0).max(100).default(0),
  // For time-decay calculations when enabled. Seconds window considered "early".
  windowSeconds: z.number().int().min(1).max(120).default(10)
})
export type EarlyAnswerScoring = z.infer<typeof EarlyAnswerScoringSchema>

// Common fields for all questions
export const BaseQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  explanation: z.string().optional(),
  // Optional overrides of quiz defaults
  timeLimitSeconds: z.number().int().positive().max(600).optional(),
  points: z.number().int().nonnegative().optional(),
  earlyAnswerScoring: EarlyAnswerScoringSchema.optional()
})

// Single-correct multiple choice
export const McqQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('mcq'),
  choices: z.array(ChoiceSchema).min(2),
  correctChoiceId: z.string().min(1),
  shuffleChoices: z.boolean().default(true)
}).superRefine((val, ctx) => {
  const choiceIds = new Set(val.choices.map((c) => c.id))
  if (!choiceIds.has(val.correctChoiceId)) {
    ctx.addIssue({
      code: 'custom',
      message: 'correctChoiceId must match one of choices.id',
      path: ['correctChoiceId']
    })
  }
})
export type McqQuestion = z.infer<typeof McqQuestionSchema>

// Multi-select (multiple correct answers)
export const MultiSelectQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('multi_select'),
  choices: z.array(ChoiceSchema).min(2),
  correctChoiceIds: z.array(z.string().min(1)).min(1),
  minSelections: z.number().int().min(1).optional(),
  maxSelections: z.number().int().min(1).optional(),
  shuffleChoices: z.boolean().default(true)
}).superRefine((val, ctx) => {
  const choiceIds = new Set(val.choices.map((c) => c.id))
  const allValid = val.correctChoiceIds.every((id) => choiceIds.has(id))
  if (!allValid) {
    ctx.addIssue({
      code: 'custom',
      message: 'All correctChoiceIds must exist in choices.id',
      path: ['correctChoiceIds']
    })
  }
  if (
    val.minSelections !== undefined &&
    val.maxSelections !== undefined &&
    val.maxSelections < val.minSelections
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'maxSelections must be >= minSelections',
      path: ['maxSelections']
    })
  }
})
export type MultiSelectQuestion = z.infer<typeof MultiSelectQuestionSchema>

// True / False
export const TrueFalseQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('true_false'),
  correct: z.boolean()
})
export type TrueFalseQuestion = z.infer<typeof TrueFalseQuestionSchema>

// Short text input
export const InputQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('input'),
  // Accept more than one correct answer variant
  correctAnswers: z.array(z.string().min(1)).min(1),
  validation: z
    .object({
      caseSensitive: z.boolean().default(false),
      trimWhitespace: z.boolean().default(true),
      normalizeWhitespace: z.boolean().default(true)
    })
    .default({
      caseSensitive: false,
      trimWhitespace: true,
      normalizeWhitespace: true
    })
})
export type InputQuestion = z.infer<typeof InputQuestionSchema>

export const QuestionSchema = z.discriminatedUnion('type', [
  McqQuestionSchema,
  MultiSelectQuestionSchema,
  TrueFalseQuestionSchema,
  InputQuestionSchema
])
export type Question = z.infer<typeof QuestionSchema>

// Quiz-level settings
export const NavigationModeSchema = z.enum(['auto', 'host'])
export type NavigationMode = z.infer<typeof NavigationModeSchema>

export const AccessSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('scheduled'),
    startAt: z.iso.datetime(), // ISO8601
    // Optional: how long after start participants are allowed to join
    joinWindowSeconds: z.number().int().min(0).max(3600).default(0)
  }),
  z.object({
    mode: z.literal('rolling'),
    // How long each participant has from their start time
    durationSeconds: z.number().int().min(5).max(86_400)
  })
])
export type Access = z.infer<typeof AccessSchema>

export const LeaderboardSchema = z.object({
  enabled: z.boolean().default(true)
})
export type Leaderboard = z.infer<typeof LeaderboardSchema>

export const QuizSettingsSchema = z.object({
  defaultTimeLimitSeconds: z.number().int().min(5).max(600).default(10),
  defaultPoints: z.number().int().min(0).max(100_000).default(100),
  earlyAnswerScoring: EarlyAnswerScoringSchema.default({
    enabled: false,
    mode: 'linear',
    maxBonusPercent: 0,
    windowSeconds: 10
  }),
  navigationMode: NavigationModeSchema.default('auto'),
  access: AccessSchema,
  leaderboard: LeaderboardSchema.default({ enabled: true }),
  // If true, question-level overrides are allowed and respected
  allowQuestionOverride: z.boolean().default(true)
})
export type QuizSettings = z.infer<typeof QuizSettingsSchema>

export const QuizSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  settings: QuizSettingsSchema,
  questions: z.array(QuestionSchema).min(1),
  tags: z.array(z.string().min(1)).optional(),
  version: z.string().default('1'),
  createdAt: z.iso.datetime().optional()
})
export type Quiz = z.infer<typeof QuizSchema>

// Helper to compute effective per-question config (time, points, early-score) from quiz defaults + overrides
export const getEffectiveQuestionConfig = (
  question: Question,
  settings: QuizSettings
) => {
  const timeLimitSeconds =
    question.timeLimitSeconds ?? settings.defaultTimeLimitSeconds

  const points = question.points ?? settings.defaultPoints

  const earlyAnswerScoring =
    question.earlyAnswerScoring ?? settings.earlyAnswerScoring

  return { timeLimitSeconds, points, earlyAnswerScoring }
}
export type EffectiveQuestionConfig = ReturnType<
  typeof getEffectiveQuestionConfig
>
