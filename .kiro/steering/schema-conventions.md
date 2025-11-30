# Schema Conventions for ORPC Contracts

## Overview

This document defines the conventions for writing Zod schemas for ORPC API contracts in the Rovierr monorepo. Following these conventions ensures consistency, maintainability, and a single source of truth derived from the database schema.

## Architecture

### Three-Layer Schema System

```
Database Schema (Drizzle)
         ↓
Generated Schemas (drizzle-zod)
         ↓
API Contract Schemas (Extended/Modified)
```

## File Structure

For each domain (e.g., `form`, `user`, `course`):

```
packages/orpc-contracts/src/{domain}/
├── generated-schemas.ts    # Auto-generated from database
├── schemas.ts              # API-specific schemas
└── index.ts                # ORPC contract definitions
```

## 1. Generated Schemas (`generated-schemas.ts`)

### Purpose
- Auto-generated Zod schemas from Drizzle database tables
- **DO NOT MODIFY MANUALLY**
- Source of truth for database structure

### Pattern

```typescript
/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import {
  users,
  posts,
  comments
} from '@rov/db/schema'
import { createInsertSchema, createSelectSchema, updateUserSchema } from 'drizzle-zod'

// ============================================================================
// Users Schemas
// ============================================================================
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const updateUserSchema = createUpdateSchema(users)

// ============================================================================
// Posts Schemas
// ============================================================================
export const insertPostSchema = createInsertSchema(posts)
export const selectPostSchema = createSelectSchema(posts)
export const updatePostSchema = createUpdateSchema(posts)

// ============================================================================
// Comments Schemas
// ============================================================================
export const insertCommentSchema = createInsertSchema(comments)
export const selectCommentSchema = createSelectSchema(comments)
export const updateCommentSchema = createUpdateSchema(comments)
```

### Rules
- ✅ Only import from `@rov/db/schema`
- ✅ Use `createInsertSchema()`, `createSelectSchema()`, and `createUpdateSchema()` for each table
- ✅ Group by table with clear section comments
- ✅ Always generate all three schema types (insert, select, update) for consistency
- ❌ No custom validation
- ❌ No composite schemas
- ❌ No manual enum definitions (enums are automatically extracted by drizzle-zod)

## 2. API Contract Schemas (`schemas.ts`)

### Purpose
- Extends generated schemas for API-specific use cases
- Adds custom validation
- Creates composite schemas with relations
- Defines enums for reuse

### Structure

```typescript
/**
 * Consolidated {Domain} Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import {
  insertUserSchema,
  selectUserSchema,
  // ... other generated schemas
} from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

/**
 * Extract enum schemas directly from generated schemas using `.shape.fieldName`
 *
 * This approach:
 * - Avoids manual duplication of enum values
 * - Ensures enums stay in sync with database schema
 * - Leverages drizzle-zod's automatic enum extraction
 *
 * When you define an enum in Drizzle:
 *   status: text('status', { enum: ['active', 'inactive'] })
 *
 * drizzle-zod automatically creates a z.enum() in the generated schema.
 * We extract it here for reuse across the API.
 */
export const userRoleSchema = selectUserSchema.shape.role
export const userStatusSchema = selectUserSchema.shape.status

// ============================================================================
// Composite Schemas (for API responses with relations)
// ============================================================================

/**
 * Full user schema with posts and profile included
 */
export const fullUserSchema = selectUserSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    posts: z.array(selectPostSchema),
    profile: selectProfileSchema.nullable()
  })

export type FullUser = z.infer<typeof fullUserSchema>

// ============================================================================
// Input Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for creating a new user
 */
export const createUserSchema = insertUserSchema
  .pick({
    email: true,
    name: true,
    role: true
  })
  .extend({
    // Add custom validation
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required').max(100),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })

/**
 * Schema for updating a user
 */
export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().min(1, 'User ID is required')
})

// ============================================================================
// Query Schemas
// ============================================================================

/**
 * Schema for listing users with filters
 */
export const listUsersSchema = selectUserSchema
  .pick({
    role: true,
    status: true
  })
  .partial()
  .extend({
    search: z.string().optional(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0)
  })

// ============================================================================
// Type Exports
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ListUsersQuery = z.infer<typeof listUsersSchema>
```

### Patterns

#### Creating Input Schemas

Use `.pick()` to select fields, then `.extend()` to add validation:

```typescript
// ✅ GOOD - Extend generated schema
export const createFormSchema = insertFormSchema
  .pick({
    title: true,
    description: true,
    entityType: true
  })
  .extend({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional()
  })

// ❌ BAD - Manual duplication
export const createFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  entityType: z.enum(['society', 'event', 'survey'])
})
```

#### Update Schemas

Use the generated `updateSchema` from drizzle-zod, pick fields, and add validation:

```typescript
// Import the generated update schema
import {
  updateUserSchema as generatedUpdateUserSchema
} from './generated-schemas'

// Use it as the base
export const updateUserSchema = generatedUpdateUserSchema
  .pick({
    id: true,
    email: true,
    name: true,
    role: true
  })
  .extend({
    id: z.string().min(1, 'User ID is required'),
    email: z.string().email('Invalid email address').optional(),
    name: z.string().min(1, 'Name is required').max(100).optional()
  })
```

**Why use `createUpdateSchema`?**
- ✅ Automatically makes all fields optional (except primary keys)
- ✅ Proper handling of database constraints
- ✅ Consistent with database update behavior

#### Query/Filter Schemas

Pick filterable fields and add pagination:

```typescript
export const listFormsSchema = selectFormSchema
  .pick({
    entityType: true,
    status: true
  })
  .partial()
  .extend({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0)
  })
```

#### Composite Schemas with Relations

Override Date fields to strings for API responses:

```typescript
export const fullFormSchema = selectFormSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    pages: z.array(selectFormPageSchema),
    questions: z.array(selectFormQuestionSchema)
  })
```

## 3. ORPC Contract Definitions (`index.ts`)

### Purpose
- Defines API routes using ORPC
- Uses schemas from `schemas.ts`
- Defines input/output/error types

### Pattern

```typescript
import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  createUserSchema,
  updateUserSchema,
  fullUserSchema,
  listUsersSchema,
  userRoleSchema
} from './schemas'

export const user = {
  create: oc
    .route({
      method: 'POST',
      description: 'Create a new user',
      summary: 'Create User',
      tags: ['User']
    })
    .input(createUserSchema)
    .output(
      z.object({
        id: z.string(),
        email: z.string(),
        role: userRoleSchema
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      EMAIL_TAKEN: {
        data: z.object({
          message: z.string().default('Email already in use')
        })
      }
    }),

  get: oc
    .route({
      method: 'GET',
      description: 'Get a user by ID',
      summary: 'Get User',
      tags: ['User']
    })
    .input(z.object({ id: z.string() }))
    .output(fullUserSchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  list: oc
    .route({
      method: 'GET',
      description: 'List users with filters',
      summary: 'List Users',
      tags: ['User']
    })
    .input(listUsersSchema)
    .output(
      z.object({
        users: z.array(fullUserSchema),
        total: z.number(),
        hasMore: z.boolean()
      })
    )
}
```

### Rules for Contract Definitions

#### Input Schemas
- ✅ Use schemas from `schemas.ts`
- ✅ For simple inputs, inline `z.object({ id: z.string() })`
- ❌ Don't create complex inline schemas

#### Output Schemas
- ✅ Use composite schemas for single entity responses
- ✅ Wrap in `z.object()` for list responses with metadata
- ✅ Include pagination metadata (`total`, `hasMore`)

```typescript
// ✅ GOOD - Single entity
.output(fullUserSchema)

// ✅ GOOD - List with metadata
.output(
  z.object({
    users: z.array(fullUserSchema),
    total: z.number(),
    hasMore: z.boolean()
  })
)

// ❌ BAD - Missing metadata
.output(z.array(fullUserSchema))
```

#### Error Schemas
- ✅ Use semantic error codes (`UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`)
- ✅ Provide default messages
- ✅ Include additional context when needed

```typescript
.errors({
  UNAUTHORIZED: {
    data: z.object({
      message: z.string().default('User not authenticated')
    })
  },
  VALIDATION_ERROR: {
    data: z.object({
      message: z.string(),
      errors: z.record(z.string(), z.string())
    })
  }
})
```

## Common Patterns

### Date Handling

Database stores `Date`, API returns `string`:

```typescript
export const apiUserSchema = selectUserSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string()
  })
```

### Boolean Overrides

Drizzle may infer booleans as nullable, override explicitly:

```typescript
export const apiFormSchema = selectFormSchema
  .omit({
    isPublic: true
  })
  .extend({
    isPublic: z.boolean()
  })
```

### Optional Fields

Make fields optional for updates:

```typescript
export const updateSchema = createSchema.partial()
```

### Nested Relations

Include related entities:

```typescript
export const fullPostSchema = selectPostSchema.extend({
  author: selectUserSchema.pick({
    id: true,
    name: true,
    email: true
  }),
  comments: z.array(selectCommentSchema)
})
```

## Validation Best Practices

### String Validation

```typescript
// ✅ GOOD - Specific constraints
title: z.string().min(1, 'Title is required').max(200)
email: z.string().email('Invalid email address')
url: z.string().url('Invalid URL')

// ❌ BAD - Too loose
title: z.string()
```

### Number Validation

```typescript
// ✅ GOOD - Constrained
age: z.number().int().min(0).max(150)
price: z.number().positive()
rating: z.number().min(1).max(5)

// ❌ BAD - Unconstrained
age: z.number()
```

### Array Validation

```typescript
// ✅ GOOD - Size limits
tags: z.array(z.string()).min(1).max(10)
emails: z.array(z.string().email()).min(1, 'At least one email required')

// ❌ BAD - No limits
tags: z.array(z.string())
```

## Naming Conventions

### Schema Names
- `create{Entity}Schema` - For creating entities
- `update{Entity}Schema` - For updating entities
- `list{Entity}Schema` - For listing/filtering entities
- `full{Entity}Schema` - For complete entity with relations
- `{entity}IdSchema` - For ID parameters

### Type Names
- `Create{Entity}Input` - Input type for creation
- `Update{Entity}Input` - Input type for updates
- `Full{Entity}` - Complete entity type with relations

## Regenerating Schemas

When database schema changes:

1. Update `packages/db/src/schema/{domain}.ts`
2. Run migrations: `bun db:push`
3. Regenerate if using a script: `bun db:generate`
4. Review `packages/orpc-contracts/src/{domain}/schemas.ts`
5. Update custom validations if needed

## Benefits

✅ **Single Source of Truth** - Database drives everything
✅ **Type Safety** - Automatic TypeScript inference
✅ **Less Code** - No manual field duplication
✅ **Consistency** - Changes flow automatically
✅ **Maintainability** - Update validation in one place
✅ **Discoverability** - Clear schema organization

## Enum Extraction Pattern

### Why Extract Enums from Generated Schemas?

When you define an enum in your Drizzle schema:

```typescript
// packages/db/src/schema/user.ts
export const users = pgTable('users', {
  role: text('role', { enum: ['admin', 'user', 'moderator'] }).notNull(),
  status: text('status', { enum: ['active', 'inactive', 'banned'] }).default('active')
})
```

`drizzle-zod` automatically creates Zod enum schemas when you use `createSelectSchema()`:

```typescript
// packages/orpc-contracts/src/user/generated-schemas.ts
export const selectUserSchema = createSelectSchema(users)
// selectUserSchema.shape.role is now z.enum(['admin', 'user', 'moderator'])
// selectUserSchema.shape.status is now z.enum(['active', 'inactive', 'banned'])
```

### ✅ Correct Pattern - Extract from Generated Schema

```typescript
// packages/orpc-contracts/src/user/schemas.ts
export const userRoleSchema = selectUserSchema.shape.role
export const userStatusSchema = selectUserSchema.shape.status
```

**Benefits:**
- ✅ Single source of truth (database schema)
- ✅ No manual duplication
- ✅ Automatic sync when database changes
- ✅ Type-safe enum extraction

### ❌ Anti-Pattern - Manual Enum Definition

```typescript
// ❌ BAD - Manually redefining enums
export const userRoleSchema = z.enum(['admin', 'user', 'moderator'])
export const userStatusSchema = z.enum(['active', 'inactive', 'banned'])
```

**Problems:**
- ❌ Duplication of enum values
- ❌ Can get out of sync with database
- ❌ Manual maintenance required
- ❌ Error-prone

## Anti-Patterns

### ❌ Don't Duplicate Schemas

```typescript
// ❌ BAD
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string()
})

// ✅ GOOD
export const createUserSchema = insertUserSchema
  .pick({ email: true, name: true })
  .extend({
    email: z.string().email('Invalid email')
  })
```

### ❌ Don't Import from generated-schemas in Application Code

```typescript
// ❌ BAD
import { insertUserSchema } from '@rov/orpc-contracts/user/generated-schemas'

// ✅ GOOD
import { createUserSchema } from '@rov/orpc-contracts/user/schemas'
```

### ❌ Don't Define Enums in Multiple Places

```typescript
// ❌ BAD - Enum in contract file
const userRoleSchema = z.enum(['admin', 'user'])

// ✅ GOOD - Enum in schemas.ts, imported in contract
import { userRoleSchema } from './schemas'
```

## Migration Checklist

When creating a new domain:

- [ ] Create `generated-schemas.ts` with basic generated schemas
- [ ] Create `schemas.ts` with enums, composite schemas, and API schemas
- [ ] Create `index.ts` with ORPC contract definitions
- [ ] Export from `packages/orpc-contracts/src/index.ts`
- [ ] Update imports in application code
- [ ] Run type checks: `bun typecheck`
- [ ] Test API contracts

## Examples

See these files for reference:
- `packages/orpc-contracts/src/form/generated-schemas.ts`
- `packages/orpc-contracts/src/form/schemas.ts`
- `packages/orpc-contracts/src/form/index.ts`
- `packages/orpc-contracts/src/form/SCHEMA_CONSOLIDATION.md`
