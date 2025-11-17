import { createAccessControl } from 'better-auth/plugins/access'
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc
} from 'better-auth/plugins/organization/access'

/**
 * Define custom permissions for the organization plugin
 * This extends the default permissions with custom resources and actions
 */
const statement = {
  ...defaultStatements
  // Add custom resources and actions here if needed
  // Example: project: ["create", "update", "delete", "share"]
} as const

/**
 * Create the access control instance
 */
export const ac = createAccessControl(statement)

/**
 * Define roles with their permissions
 * These roles extend the default roles with custom permissions
 */
export const owner = ac.newRole({
  ...ownerAc.statements
})

export const admin = ac.newRole({
  ...adminAc.statements
})

export const member = ac.newRole({
  ...memberAc.statements
})

// Export the statement type for use in other files
export type PermissionStatement = typeof statement
