# Design Document

## Overview

This document outlines the design for migrating the Rovierr backend API from ORPC + Hono to Elysia. The migration will consolidate the API framework while maintaining all existing functionality, improving developer experience through better type inference, and ensuring consistent patterns across the codebase.

The migration follows a proven pattern established in the `tasks` and `realtime` routers, where:
- Schemas are co-located with route implementations
- Authentication is handled via Elysia middleware
- Error handling uses custom error classes
- Type safety is enforced through Zod validation

## Architecture

### Current Architecture (ORPC + Hono)

```
┌─────────────────────────────────────────┐
│         ORPC Contracts Package          │
│  (Type definitions + Zod schemas)       │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│         Server Implementation           │
│  - Hono for HTTP routing                │
│  - ORPC handlers for business logic     │
│  - protectedProcedure for auth          │
└─────────────────────────────────────────┘
```

### Target Architecture (Elysia)

```
┌─────────────────────────────────────────┐
│         Elysia Server                   │
│  - Unified HTTP routing + validation    │
│  - betterAuth middleware                │
│  - Co-located schemas + routes          │
│  - Custom error classes                 │
└─────────────────────────────────────────┘
```

### Key Architectural Changes

1. **Schema Co-location**: Move Zod schemas from `packages/orpc-contracts` to router files
2. **Unified Framework**: Replace ORPC + Hono with Elysia for all routing and validation
3. **Middleware Simplification**: Use Elysia's macro system for authentication
4. **Error Handling**: Replace `ORPCError` with custom error classes
5. **Type Inference**: Leverage Elysia's automatic type inference from Zod schemas

## Components and Interfaces

### 1. Router Structure

Each domain router will follow one of two patterns based on complexity:

#### Pattern A: Simple Router (< 200 lines)

```
routers/{domain}/
├── index.ts       # Routes + schemas + logic
└── errors.ts      # Custom error classes (if needed)
```

Example: `realtime`, simple CRUD routers

#### Pattern B: Complex Router (> 200 lines)

```
routers/{domain}/
├── index.ts       # Main router export
├── routes.ts      # Route definitions
├── schemas.ts     # Zod validation schemas
├── service.ts     # Business logic
├── errors.ts      # Custom error classes
└── utils.ts       # Helper functions (optional)
```

Example: `tasks`, `form`, `chat`, `discussion`

### 2. Authentication Middleware

The `betterAuth` middleware provides authentication using Elysia's macro system:

```typescript
// apps/server/src/middleware/auth.ts
export const betterAuth = new Elysia({ name: 'better-auth' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers })
      if (!session) return status(401)
      return {
        user: session.user,
        session: session.session
      }
    }
  }
})
```

Usage in routes:

```typescript
export const myRouter = new Elysia({ name: 'my-router' })
  .use(betterAuth)
  .group('/my-route', { auth: true }, (app) =>
    app.get('/protected', ({ user }) => {
      // user is automatically available
    })
  )
```

### 3. Error Handling

Custom error classes replace `ORPCError`:

```typescript
// routers/{domain}/errors.ts
export class RESOURCE_NOT_FOUND extends Error {
  constructor(message = 'Resource not found') {
    super(message)
  }
}

export class UNAUTHORIZED extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
  }
}
```

Elysia automatically converts thrown errors to appropriate HTTP responses.

### 4. Schema Definition

Schemas are defined using Zod and co-located with routes:

```typescript
// routers/{domain}/schemas.ts or index.ts
import { z } from 'zod'

export const createResourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
})

export const resourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
  updatedAt: z.string()
})
```

### 5. Route Definition

Routes use Elysia's fluent API with inline schema validation:

```typescript
export const myRouter = new Elysia({ name: 'my-router' })
  .use(betterAuth)
  .group('/resources', { auth: true }, (app) =>
    app
      .post(
        '/create',
        async ({ body, user }) => {
          // Implementation
          return resource
        },
        {
          body: createResourceSchema,
          response: resourceSchema
        }
      )
      .get(
        '/:id',
        async ({ params, user }) => {
          // Implementation
          return resource
        },
        {
          params: z.object({ id: z.string() }),
          response: resourceSchema
        }
      )
  )
```

## Data Models

### Router Mapping

The following routers need to be migrated:

| Domain | Files | Complexity | Pattern | Priority |
|--------|-------|------------|---------|----------|
| academic | enrollment.ts, index.ts | Medium | B | High |
| calendar | google.ts, index.ts | Medium | B | High |
| campus-feed | events.ts, interactions.ts, posts.ts, index.ts | High | B | High |
| career | ai.ts, applications.ts, index.ts | High | B | Medium |
| chat | index.ts | High | B | High |
| connection | index.ts | Medium | B | High |
| discussion | follows.ts, replies.ts, threads.ts, votes.ts, index.ts | High | B | High |
| expenses | index.ts | Medium | A/B | Medium |
| form | index.ts | Very High | B | High |
| people | index.ts | Medium | A/B | Medium |
| resume | index.ts | High | B | Medium |
| roadmap | index.ts | Medium | A/B | Low |
| society | index.ts | High | B | High |
| society-email | index.ts | Medium | B | Medium |
| society-registration | index.ts | Medium | B | High |
| student-organizations | index.ts | Medium | A/B | Medium |
| university | index.ts | Medium | A/B | High |
| user | profile.ts, index.ts | Medium | B | High |

### Schema Migration Strategy

For each router:

1. **Identify ORPC contracts** in `packages/orpc-contracts/src/{domain}/`
2. **Extract Zod schemas** from contract definitions
3. **Copy schemas** to router directory (either `schemas.ts` or `index.ts`)
4. **Adapt schemas** if needed (e.g., remove ORPC-specific metadata)
5. **Verify types** match database models from `@rov/db`

### Database Integration

All routers use Drizzle ORM for database operations:

```typescript
import { db } from '@api/db'
import { users, posts } from '@rov/db'
import { eq, and, desc } from 'drizzle-orm'

// Query with relations
const post = await db.query.posts.findFirst({
  where: eq(posts.id, postId),
  with: {
    author: true,
    comments: {
      with: {
        user: true
      }
    }
  }
})
```

No changes to database queries are required during migration.

##
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: HTTP Method Preservation
*For any* migrated endpoint, the HTTP method (GET, POST, PUT, DELETE, PATCH) should match the original ORPC endpoint definition
**Validates: Requirements 1.2**

### Property 2: URL Path Consistency
*For any* migrated endpoint, the URL path and route parameters should match the original ORPC contract definition
**Validates: Requirements 1.3**

### Property 3: Business Logic Equivalence
*For any* migrated endpoint with the same input, the output should be functionally equivalent to the original ORPC implementation
**Validates: Requirements 1.4**

### Property 4: Request/Response Format Consistency
*For any* migrated endpoint, the request and response data structures should match the original ORPC contract schemas
**Validates: Requirements 1.5**

### Property 5: Schema Validation Preservation
*For any* migrated schema, all validation rules and constraints should produce the same validation results as the original ORPC schema
**Validates: Requirements 2.5**

### Property 6: Authentication Middleware Usage
*For any* protected endpoint, the betterAuth middleware should be applied and user context should be accessible
**Validates: Requirements 3.1**

### Property 7: Authorization Logic Preservation
*For any* endpoint with authorization checks, the permission validation logic should produce the same authorization decisions as the original implementation
**Validates: Requirements 3.3**

### Property 8: Authentication Error Handling
*For any* endpoint requiring authentication, when authentication fails, the system should return a 401 status with an appropriate error response
**Validates: Requirements 3.4**

### Property 9: Custom Error Class Usage
*For any* error condition, the system should use custom error classes consistently across all endpoints
**Validates: Requirements 4.1**

### Property 10: Validation Error Format
*For any* request with invalid data, Zod validation should return errors with appropriate HTTP status codes and error messages
**Validates: Requirements 4.3**

### Property 11: Database Error Handling
*For any* database operation failure, the system should handle the error gracefully and return a meaningful error message
**Validates: Requirements 4.4**

### Property 12: Error Response Format Consistency
*For any* error condition, the error response format should match the original ORPC implementation's error format
**Validates: Requirements 4.5**

### Property 13: Input Validation Coverage
*For any* route with input data, Zod schemas should be used to validate the input
**Validates: Requirements 5.1**

### Property 14: Response Validation Coverage
*For any* route, Zod schemas should be used to validate the response data
**Validates: Requirements 5.2**

### Property 15: Parameter Validation
*For any* route with path parameters, Zod schemas should validate the parameters
**Validates: Requirements 5.3**

### Property 16: Query Validation
*For any* route with query parameters, Zod schemas should validate the query parameters
**Validates: Requirements 5.4**

### Property 17: Body Validation
*For any* route with a request body, Zod schemas should validate the body
**Validates: Requirements 5.5**

### Property 18: Database Query Preservation
*For any* migrated endpoint, all Drizzle ORM queries should be preserved without modification
**Validates: Requirements 7.1**

### Property 19: Transaction Boundary Preservation
*For any* endpoint using database transactions, the transaction boundaries should be maintained
**Validates: Requirements 7.2**

### Property 20: Relation Query Preservation
*For any* database query with relations, the `with` clauses for eager loading should be preserved
**Validates: Requirements 7.3**

### Property 21: Database Error Handling
*For any* database operation, errors should be handled appropriately and return meaningful responses
**Validates: Requirements 7.4**

### Property 22: Database Response Format
*For any* database operation, the returned data format should match the original implementation
**Validates: Requirements 7.5**

### Property 23: Real-time Channel Naming
*For any* real-time event publication, the channel naming convention should match the original implementation
**Validates: Requirements 8.2**

### Property 24: Real-time Subscription Preservation
*For any* real-time subscription, the subscription logic should produce the same behavior as the original implementation
**Validates: Requirements 8.3**

### Property 25: Real-time Error Handling
*For any* real-time connection failure, the system should handle errors gracefully
**Validates: Requirements 8.5**

### Property 26: OpenAPI Metadata Coverage
*For any* route, OpenAPI metadata (description, summary, tags) should be included
**Validates: Requirements 9.1**

### Property 27: Schema Field Documentation
*For any* schema field, descriptions should be included where appropriate
**Validates: Requirements 9.3**

### Property 28: Response Type Documentation
*For any* route, all possible response types should be documented
**Validates: Requirements 9.4**

### Property 29: Error Response Documentation
*For any* route, all possible error responses should be documented
**Validates: Requirements 9.5**

### Property 30: Request/Response Contract Preservation
*For any* migrated endpoint, the request/response contracts should remain unchanged for backward compatibility
**Validates: Requirements 10.1**

### Property 31: Performance Maintenance
*For any* migrated endpoint, response times should be within 10% of the original implementation
**Validates: Requirements 11.1**

### Property 32: Query Performance Preservation
*For any* database query, performance should be maintained or improved compared to the original implementation
**Validates: Requirements 11.3**

### Property 33: Concurrent Request Handling
*For any* load test scenario, the system should scale similarly to the original implementation
**Validates: Requirements 11.4**

### Property 34: Memory Usage Stability
*For any* workload, memory usage should not increase significantly compared to the original implementation
**Validates: Requirements 11.5**

### Property 35: Request Format Compatibility
*For any* existing client request format, the migrated endpoint should accept and process it correctly
**Validates: Requirements 12.1**

### Property 36: Response Structure Compatibility
*For any* endpoint response, the structure should match the original implementation for backward compatibility
**Validates: Requirements 12.2**

### Property 37: Error Format Compatibility
*For any* error response, the format should match the original implementation for backward compatibility
**Validates: Requirements 12.3**

### Property 38: Endpoint Response Correctness
*For any* migrated endpoint call, the response should match the expected output
**Validates: Requirements 13.3**

### Property 39: Validation Error Messages
*For any* validation failure, appropriate error messages should be returned
**Validates: Requirements 13.4**

## Error Handling

### Error Class Hierarchy

```typescript
// Base error classes
export class UNAUTHORIZED extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
  }
}

export class NOT_FOUND extends Error {
  constructor(message = 'Resource not found') {
    super(message)
  }
}

export class FORBIDDEN extends Error {
  constructor(message = 'Forbidden') {
    super(message)
  }
}

export class BAD_REQUEST extends Error {
  constructor(message = 'Bad request') {
    super(message)
  }
}

export class INTERNAL_SERVER_ERROR extends Error {
  constructor(message = 'Internal server error') {
    super(message)
  }
}
```

### Error Handling Pattern

```typescript
// In route handlers
try {
  const resource = await db.query.resources.findFirst({
    where: eq(resources.id, id)
  })

  if (!resource) {
    throw new NOT_FOUND('Resource not found')
  }

  // Check authorization
  if (resource.userId !== user.id) {
    throw new UNAUTHORIZED('You do not have permission to access this resource')
  }

  return resource
} catch (error) {
  if (error instanceof NOT_FOUND || error instanceof UNAUTHORIZED) {
    throw error
  }

  // Log unexpected errors
  console.error('Unexpected error:', error)
  throw new INTERNAL_SERVER_ERROR('An unexpected error occurred')
}
```

### Validation Error Handling

Elysia automatically handles Zod validation errors and returns appropriate HTTP status codes (400) with detailed error messages. No custom handling is required for validation errors.

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Schema validation logic
- Error class instantiation
- Helper function behavior
- Service layer business logic

Example:
```typescript
describe('Task Schema Validation', () => {
  it('should validate valid task creation input', () => {
    const input = {
      title: 'Test Task',
      contextType: 'personal',
      contextId: 'user-123',
      priority: 'medium',
      status: 'todo'
    }

    const result = createTaskSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should reject invalid priority', () => {
    const input = {
      title: 'Test Task',
      contextType: 'personal',
      contextId: 'user-123',
      priority: 'invalid',
      status: 'todo'
    }

    const result = createTaskSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})
```

### Integration Testing

Integration tests will verify:
- End-to-end request/response flow
- Authentication and authorization
- Database operations
- Error handling
- Real-time functionality

Example:
```typescript
describe('Task API', () => {
  it('should create a personal task', async () => {
    const response = await app.handle(
      new Request('http://localhost/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Test Task',
          contextType: 'personal',
          contextId: userId,
          priority: 'high'
        })
      })
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.title).toBe('Test Task')
    expect(data.priority).toBe('high')
  })

  it('should return 401 for unauthenticated requests', async () => {
    const response = await app.handle(
      new Request('http://localhost/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Task',
          contextType: 'personal',
          contextId: userId
        })
      })
    )

    expect(response.status).toBe(401)
  })
})
```

### Property-Based Testing

Property-based tests will verify:
- Schema validation properties
- Business logic invariants
- Error handling consistency
- Performance characteristics

We will use `fast-check` for property-based testing in TypeScript.

Example:
```typescript
import fc from 'fast-check'

describe('Task Schema Properties', () => {
  it('should validate any valid task input', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          contextType: fc.constantFrom('personal', 'club'),
          contextId: fc.uuid(),
          priority: fc.constantFrom('low', 'medium', 'high'),
          status: fc.constantFrom('todo', 'in_progress', 'done')
        }),
        (input) => {
          const result = createTaskSchema.safeParse(input)
          return result.success === true
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Migration Verification Testing

For each migrated router, we will:
1. Run TypeScript compiler to verify no type errors
2. Start the server and verify all routes are registered
3. Run integration tests to verify functionality
4. Compare response formats with original ORPC implementation
5. Run performance benchmarks to verify no regression

### Test Coverage Goals

- Unit test coverage: > 80%
- Integration test coverage: > 70%
- Property-based tests: At least one per domain
- All critical paths must have tests

## Migration Process

### Phase 1: Preparation (1-2 days)

1. **Audit existing routers**
   - List all ORPC endpoints
   - Identify dependencies
   - Document current behavior

2. **Set up testing infrastructure**
   - Configure test environment
   - Set up integration test framework
   - Create test utilities

3. **Create migration checklist**
   - Template for router migration
   - Verification steps
   - Documentation requirements

### Phase 2: Core Routers (3-5 days)

Migrate high-priority, high-traffic routers:
1. user (profile)
2. chat
3. connection
4. campus-feed
5. discussion
6. society
7. university

### Phase 3: Feature Routers (3-5 days)

Migrate feature-specific routers:
1. form
2. academic
3. calendar
4. career
5. resume
6. society-registration

### Phase 4: Supporting Routers (2-3 days)

Migrate remaining routers:
1. expenses
2. people
3. roadmap
4. society-email
5. student-organizations

### Phase 5: Cleanup and Verification (2-3 days)

1. **Remove ORPC dependencies**
   - Remove `@orpc/server` and `@orpc/contract` from package.json
   - Remove ORPC contract files
   - Update imports across codebase

2. **Update documentation**
   - Update API documentation
   - Update developer guides
   - Update deployment docs

3. **Final testing**
   - Run full test suite
   - Perform load testing
   - Verify all endpoints work correctly

4. **Deploy to staging**
   - Deploy to staging environment
   - Run smoke tests
   - Monitor for issues

### Migration Checklist (Per Router)

- [ ] Identify ORPC contracts in `packages/orpc-contracts/src/{domain}/`
- [ ] Create router directory structure (Pattern A or B)
- [ ] Extract and copy Zod schemas
- [ ] Create error classes if needed
- [ ] Implement routes using Elysia
- [ ] Apply authentication middleware
- [ ] Preserve all business logic
- [ ] Maintain database queries
- [ ] Add OpenAPI metadata
- [ ] Write/update unit tests
- [ ] Write/update integration tests
- [ ] Verify TypeScript compilation
- [ ] Test endpoints manually
- [ ] Update server index.ts to use new router
- [ ] Document any breaking changes
- [ ] Code review
- [ ] Merge to main branch

## Deployment Strategy

### Staging Deployment

1. Deploy migrated routers to staging environment
2. Run automated tests
3. Perform manual testing
4. Monitor logs and metrics
5. Fix any issues found

### Production Deployment

1. Deploy during low-traffic period
2. Use feature flags if possible
3. Monitor error rates and response times
4. Have rollback plan ready
5. Gradually increase traffic to new endpoints

### Rollback Plan

If issues are discovered:
1. Revert to previous deployment
2. Investigate root cause
3. Fix issues in development
4. Re-test thoroughly
5. Re-deploy when ready

## Performance Considerations

### Optimization Strategies

1. **Schema Validation**
   - Use Zod's `.strict()` for better performance
   - Cache compiled schemas where possible
   - Use `.transform()` sparingly

2. **Database Queries**
   - Maintain existing query optimization
   - Use indexes appropriately
   - Avoid N+1 queries with proper eager loading

3. **Middleware**
   - Keep middleware lightweight
   - Cache authentication results when appropriate
   - Use connection pooling for database

4. **Response Serialization**
   - Use efficient JSON serialization
   - Avoid unnecessary data transformations
   - Stream large responses when possible

### Monitoring

Monitor the following metrics:
- Request latency (p50, p95, p99)
- Error rates
- Database query performance
- Memory usage
- CPU usage
- Concurrent connections

## Security Considerations

### Authentication

- All protected routes must use `betterAuth` middleware
- Session validation on every request
- Proper error handling for auth failures

### Authorization

- Preserve all existing authorization checks
- Verify user permissions before operations
- Log authorization failures

### Input Validation

- Validate all inputs using Zod schemas
- Sanitize user inputs
- Prevent SQL injection through parameterized queries

### Error Messages

- Don't expose sensitive information in error messages
- Log detailed errors server-side
- Return generic errors to clients

## Documentation

### API Documentation

- OpenAPI/Swagger documentation auto-generated from Elysia routes
- Available at `/swagger` endpoint
- Include examples for all endpoints

### Developer Documentation

- Migration guide for developers
- Elysia best practices
- Code organization guidelines
- Testing guidelines

### Deployment Documentation

- Deployment process
- Environment configuration
- Monitoring and alerting
- Troubleshooting guide

## Success Criteria

The migration will be considered successful when:

1. ✅ All ORPC endpoints are migrated to Elysia
2. ✅ All tests pass (unit, integration, property-based)
3. ✅ TypeScript compilation succeeds with no errors
4. ✅ Server starts and all routes are registered
5. ✅ Performance is within 10% of original implementation
6. ✅ No increase in error rates
7. ✅ All ORPC dependencies are removed
8. ✅ Documentation is updated
9. ✅ Code review is complete
10. ✅ Successfully deployed to production

## Risks and Mitigation

### Risk 1: Breaking Changes

**Risk**: Migration introduces breaking changes for clients

**Mitigation**:
- Maintain backward compatibility
- Thorough testing of request/response formats
- Version API if necessary
- Communicate changes to frontend team

### Risk 2: Performance Regression

**Risk**: Migrated endpoints are slower than original

**Mitigation**:
- Benchmark before and after migration
- Profile slow endpoints
- Optimize as needed
- Monitor production metrics

### Risk 3: Missing Functionality

**Risk**: Some functionality is lost during migration

**Mitigation**:
- Comprehensive testing
- Code review
- Manual testing of all endpoints
- Gradual rollout with monitoring

### Risk 4: Authentication Issues

**Risk**: Authentication breaks after migration

**Mitigation**:
- Test authentication thoroughly
- Verify session handling
- Test with different auth scenarios
- Have rollback plan ready

### Risk 5: Database Issues

**Risk**: Database queries behave differently

**Mitigation**:
- Preserve all database queries
- Test with production-like data
- Monitor query performance
- Use transactions appropriately

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Preparation | 1-2 days | Audit, setup testing, create checklist |
| Core Routers | 3-5 days | Migrate high-priority routers |
| Feature Routers | 3-5 days | Migrate feature-specific routers |
| Supporting Routers | 2-3 days | Migrate remaining routers |
| Cleanup & Verification | 2-3 days | Remove ORPC, update docs, final testing |
| **Total** | **11-18 days** | **Complete migration** |

## Conclusion

This migration from ORPC + Hono to Elysia will consolidate the backend API framework, improve developer experience, and maintain all existing functionality. By following the established patterns from the `tasks` and `realtime` routers, we ensure consistency across the codebase. The comprehensive testing strategy and phased approach minimize risks and ensure a smooth transition.
