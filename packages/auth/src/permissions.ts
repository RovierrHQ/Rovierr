import { createAccessControl } from 'better-auth/plugins/access'

/**
 * Define custom permissions for the organization plugin
 * This extends the default permissions with custom resources and actions
 */
export const statement = {
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
  discussion: ['create', 'moderate']
  // more permission as we build feature
  // like: task: ["create", "update", "delete"],
  // like: event: ["create", "update", "delete"],
  // like: document: ["create", "update", "delete"],
  // like: note: ["create", "update", "delete"],
  // like: reminder: ["create", "update", "delete"],
  // like: file: ["create", "update", "delete"],
  // like: folder: ["create", "update", "delete"],
  // like: label: ["create", "update", "delete"],
} as const

/**
 * Create the access control instance
 */
export const ac = createAccessControl(statement)

/**
 * Define roles with their permissions
 * These roles extend the default roles with custom permissions
 */
export const defaultPresident = ac.newRole({
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
  discussion: ['create', 'moderate']
})

export const defaultVicePresident = ac.newRole({
  organization: ['update'],
  invitation: ['create', 'cancel'],
  member: ['create', 'update', 'delete'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
  discussion: ['create', 'moderate']
})

export const defaultMember = ac.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ['read'],
  discussion: ['create']
})

// Export the statement type for use in other files
export type PermissionStatement = typeof statement
