/**
 * Variable Replacement Engine for Society Emails
 *
 * Replaces template variables like {{user.name}} with actual values
 */

interface VariableContext {
  user: {
    name: string
    email: string
    username: string | null
  }
  organization: {
    name: string
  }
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Replaces variables in a template string with values from context
 *
 * Supports variables in the format: {{user.name}}, {{user.email}}, {{organization.name}}
 *
 * @param template - The template string containing variables
 * @param context - The context object with user and organization data
 * @param escapeValues - Whether to HTML-escape the replaced values (default: true)
 * @returns The template with variables replaced
 *
 * @example
 * replaceVariables('Hello {{user.name}}!', { user: { name: 'John', ... }, ... })
 * // Returns: 'Hello John!'
 */
export function replaceVariables(
  template: string,
  context: VariableContext,
  escapeValues = true
): string {
  // Replace all {{variable}} patterns
  return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const trimmedVar = variable.trim()

    // Split by dot to handle nested properties
    const parts = trimmedVar.split('.')

    if (parts.length !== 2) {
      // Invalid variable format, return as-is
      return match
    }

    const [object, property] = parts

    // Get the value from context
    let value: string | null = null

    if (object === 'user' && property in context.user) {
      value = context.user[property as keyof typeof context.user]
    } else if (object === 'organization' && property in context.organization) {
      value =
        context.organization[property as keyof typeof context.organization]
    }

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return ''
    }

    // Escape HTML if needed
    return escapeValues ? escapeHtml(value) : value
  })
}

/**
 * Validates that all variables in a template are valid
 *
 * @param template - The template string to validate
 * @returns Array of invalid variable names, empty if all valid
 *
 * @example
 * validateVariables('Hello {{user.name}} and {{user.invalid}}')
 * // Returns: ['user.invalid']
 */
export function validateVariables(template: string): string[] {
  const validVariables = new Set([
    'user.name',
    'user.email',
    'user.username',
    'organization.name'
  ])

  const invalidVariables: string[] = []

  // Find all {{variable}} patterns
  const variableRegex = /\{\{([^}]+)\}\}/g
  const matches = template.matchAll(variableRegex)

  for (const match of matches) {
    const variable = match[1].trim()

    if (!validVariables.has(variable)) {
      invalidVariables.push(variable)
    }
  }

  return invalidVariables
}

/**
 * Extracts all variables from a template
 *
 * @param template - The template string
 * @returns Array of variable names found in the template
 *
 * @example
 * extractVariables('Hello {{user.name}}, email: {{user.email}}')
 * // Returns: ['user.name', 'user.email']
 */
export function extractVariables(template: string): string[] {
  const variables: string[] = []
  const variableRegex = /\{\{([^}]+)\}\}/g
  const matches = template.matchAll(variableRegex)

  for (const match of matches) {
    const variable = match[1].trim()
    if (!variables.includes(variable)) {
      variables.push(variable)
    }
  }

  return variables
}
