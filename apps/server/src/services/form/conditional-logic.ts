/**
 * Conditional Logic Service
 * Evaluates conditional logic for questions and pages
 */

import type { ConditionOperator } from '@rov/shared'

/**
 * Evaluate a single condition
 */
export function evaluateCondition(
  operator: ConditionOperator,
  actualValue: unknown,
  expectedValue: unknown
): boolean {
  // Handle null/undefined cases
  if (actualValue === null || actualValue === undefined) {
    return operator === 'not_equals'
  }

  switch (operator) {
    case 'equals':
      if (Array.isArray(actualValue)) {
        return actualValue.includes(expectedValue as string)
      }
      return actualValue === expectedValue

    case 'not_equals':
      if (Array.isArray(actualValue)) {
        return !actualValue.includes(expectedValue as string)
      }
      return actualValue !== expectedValue

    case 'contains':
      if (
        typeof actualValue === 'string' &&
        typeof expectedValue === 'string'
      ) {
        return actualValue.toLowerCase().includes(expectedValue.toLowerCase())
      }
      if (Array.isArray(actualValue)) {
        return actualValue.includes(expectedValue as string)
      }
      return false

    case 'not_contains':
      if (
        typeof actualValue === 'string' &&
        typeof expectedValue === 'string'
      ) {
        return !actualValue.toLowerCase().includes(expectedValue.toLowerCase())
      }
      if (Array.isArray(actualValue)) {
        return !actualValue.includes(expectedValue as string)
      }
      return true

    default:
      return false
  }
}

/**
 * Evaluate conditional logic for a question or page
 */
export function evaluateConditionalLogic(
  sourceQuestionId: string,
  condition: ConditionOperator,
  conditionValue: string,
  responses: Record<string, unknown>
): boolean {
  // Get the actual value from responses
  const actualValue = responses[sourceQuestionId]

  return evaluateCondition(condition, actualValue, conditionValue)
}

/**
 * Get all visible questions based on conditional logic
 */
export function getVisibleQuestions(
  questions: Array<{
    id: string
    conditionalLogicEnabled: boolean
    sourceQuestionId?: string | null
    condition?: string | null
    conditionValue?: string | null
  }>,
  responses: Record<string, unknown>
): Set<string> {
  const visibleQuestions = new Set<string>()

  // Build dependency graph
  const dependencyGraph = new Map<string, string[]>()
  for (const question of questions) {
    if (question.conditionalLogicEnabled && question.sourceQuestionId) {
      const deps = dependencyGraph.get(question.sourceQuestionId) || []
      deps.push(question.id)
      dependencyGraph.set(question.sourceQuestionId, deps)
    }
  }

  // Evaluate visibility for each question
  for (const question of questions) {
    // Questions without conditional logic are always visible
    if (!question.conditionalLogicEnabled) {
      visibleQuestions.add(question.id)
      continue
    }

    // Questions with conditional logic need evaluation
    if (
      question.sourceQuestionId &&
      question.condition &&
      question.conditionValue !== null &&
      question.conditionValue !== undefined
    ) {
      const isVisible = evaluateConditionalLogic(
        question.sourceQuestionId,
        question.condition as ConditionOperator,
        question.conditionValue,
        responses
      )
      if (isVisible) {
        visibleQuestions.add(question.id)
      }
    }
  }

  return visibleQuestions
}

/**
 * Get all visible pages based on conditional logic
 */
export function getVisiblePages(
  pages: Array<{
    id: string
    conditionalLogicEnabled: boolean
    sourceQuestionId?: string | null
    condition?: string | null
    conditionValue?: string | null
  }>,
  responses: Record<string, unknown>
): Set<string> {
  const visiblePages = new Set<string>()

  for (const page of pages) {
    // Pages without conditional logic are always visible
    if (!page.conditionalLogicEnabled) {
      visiblePages.add(page.id)
      continue
    }

    // Pages with conditional logic need evaluation
    if (
      page.sourceQuestionId &&
      page.condition &&
      page.conditionValue !== null &&
      page.conditionValue !== undefined
    ) {
      const isVisible = evaluateConditionalLogic(
        page.sourceQuestionId,
        page.condition as ConditionOperator,
        page.conditionValue,
        responses
      )
      if (isVisible) {
        visiblePages.add(page.id)
      }
    }
  }

  return visiblePages
}

/**
 * Clear values for hidden questions
 */
export function clearHiddenQuestionValues(
  responses: Record<string, unknown>,
  visibleQuestions: Set<string>,
  allQuestionIds: string[]
): Record<string, unknown> {
  const cleanedResponses = { ...responses }

  for (const questionId of allQuestionIds) {
    if (!visibleQuestions.has(questionId)) {
      delete cleanedResponses[questionId]
    }
  }

  return cleanedResponses
}

/**
 * Detect circular dependencies in conditional logic
 */
export function detectCircularDependencies(
  questions: Array<{
    id: string
    conditionalLogicEnabled: boolean
    sourceQuestionId?: string | null
  }>
): { hasCircular: boolean; cycles?: string[][] } {
  // Build dependency graph
  const graph = new Map<string, string[]>()
  for (const question of questions) {
    if (question.conditionalLogicEnabled && question.sourceQuestionId) {
      const deps = graph.get(question.id) || []
      deps.push(question.sourceQuestionId)
      graph.set(question.id, deps)
    }
  }

  // Detect cycles using DFS
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cycles: string[][] = []

  function dfs(node: string, path: string[]): boolean {
    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path])) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor)
        const cycle = path.slice(cycleStart)
        cycles.push([...cycle, neighbor])
        return true
      }
    }

    recursionStack.delete(node)
    return false
  }

  for (const question of questions) {
    if (!visited.has(question.id)) {
      dfs(question.id, [])
    }
  }

  return {
    hasCircular: cycles.length > 0,
    cycles: cycles.length > 0 ? cycles : undefined
  }
}

/**
 * Validate conditional logic configuration
 */
export function validateConditionalLogic(
  questions: Array<{
    id: string
    conditionalLogicEnabled: boolean
    sourceQuestionId?: string | null
    condition?: string | null
    conditionValue?: string | null
  }>
): { valid: boolean; errors?: string[] } {
  const errors: string[] = []

  // Check for circular dependencies
  const circularCheck = detectCircularDependencies(questions)
  if (circularCheck.hasCircular) {
    errors.push(
      `Circular dependencies detected: ${circularCheck.cycles?.map((cycle) => cycle.join(' -> ')).join(', ')}`
    )
  }

  // Check that source questions exist
  const questionIds = new Set(questions.map((q) => q.id))
  for (const question of questions) {
    if (
      question.conditionalLogicEnabled &&
      question.sourceQuestionId &&
      !questionIds.has(question.sourceQuestionId)
    ) {
      errors.push(
        `Question ${question.id} references non-existent source question ${question.sourceQuestionId}`
      )
    }
  }

  // Check that conditional logic is complete
  for (const question of questions) {
    if (question.conditionalLogicEnabled) {
      if (!question.sourceQuestionId) {
        errors.push(
          `Question ${question.id} has conditional logic enabled but no source question`
        )
      }
      if (!question.condition) {
        errors.push(
          `Question ${question.id} has conditional logic enabled but no condition`
        )
      }
      if (
        question.conditionValue === null ||
        question.conditionValue === undefined
      ) {
        errors.push(
          `Question ${question.id} has conditional logic enabled but no condition value`
        )
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}
