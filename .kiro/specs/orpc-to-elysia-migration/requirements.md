# Requirements Document

## Introduction

This specification defines the requirements for migrating the Rovierr backend API from ORPC + Hono to Elysia. The migration aims to consolidate the API framework while maintaining all existing functionality, improving developer experience, and ensuring type safety. The migration follows the pattern established in the `tasks` and `realtime` endpoints, where schemas are co-located with route implementations.

## Glossary

- **ORPC**: Type-safe RPC framework currently used for API contracts
- **Hono**: Lightweight web framework currently used for HTTP routing
- **Elysia**: Modern TypeScript web framework that will replace both ORPC and Hono
- **API Endpoint**: A specific route that handles HTTP requests (GET, POST, PUT, DELETE, etc.)
- **Schema**: Zod validation schema defining input/output types for API endpoints
- **Router**: A collection of related API endpoints grouped by domain (e.g., user, tasks, chat)
- **Migration**: The process of converting existing ORPC + Hono endpoints to Elysia
- **Co-location**: Placing schemas and route implementations in the same file or directory
- **MVC Pattern**: Model-View-Controller pattern where routes, services, and schemas are separated into different files

## Requirements

### Requirement 1: Endpoint Migration

**User Story:** As a backend developer, I want all existing ORPC + Hono endpoints migrated to Elysia, so that the codebase uses a single, modern framework.

#### Acceptance Criteria

1. WHEN all router files are processed THEN the system SHALL convert each ORPC endpoint to an equivalent Elysia route
2. WHEN an endpoint is migrated THEN the system SHALL preserve all HTTP methods (GET, POST, PUT, DELETE, PATCH)
3. WHEN an endpoint is migrated THEN the system SHALL maintain the same URL paths and route parameters
4. WHEN an endpoint is migrated THEN the system SHALL preserve all business logic without modification
5. WHEN an endpoint is migrated THEN the system SHALL maintain the same request/response formats

### Requirement 2: Schema Migration and Co-location

**User Story:** As a backend developer, I want schemas co-located with route implementations, so that related code is easy to find and maintain.

#### Acceptance Criteria

1. WHEN migrating an endpoint THEN the system SHALL extract Zod schemas from ORPC contracts
2. WHEN schemas are extracted THEN the system SHALL place them in the same directory as the route implementation
3. WHEN a router has simple endpoints THEN the system SHALL place schemas and routes in a single `index.ts` file
4. WHEN a router has complex endpoints THEN the system SHALL organize code using MVC pattern with separate `schemas.ts`, `routes.ts`, and `service.ts` files
5. WHEN schemas are migrated THEN the system SHALL preserve all validation rules and constraints

### Requirement 3: Authentication and Authorization

**User Story:** As a backend developer, I want authentication and authorization to work consistently across all migrated endpoints, so that security is maintained.

#### Acceptance Criteria

1. WHEN an endpoint requires authentication THEN the system SHALL use the `betterAuth` middleware
2. WHEN a route group requires authentication THEN the system SHALL apply `{ auth: true }` to the group
3. WHEN authorization checks exist THEN the system SHALL preserve all permission validation logic
4. WHEN authentication fails THEN the system SHALL return appropriate error responses using custom error classes
5. WHEN user context is needed THEN the system SHALL access it via the `user` parameter from the route handler

### Requirement 4: Error Handling

**User Story:** As a backend developer, I want consistent error handling across all endpoints, so that clients receive predictable error responses.

#### Acceptance Criteria

1. WHEN an error occurs THEN the system SHALL use custom error classes (e.g., `UNAUTHORIZED`, `NOT_FOUND`)
2. WHEN custom errors are needed THEN the system SHALL define them in an `errors.ts` file within the router directory
3. WHEN validation fails THEN the system SHALL return Zod validation errors with appropriate HTTP status codes
4. WHEN database operations fail THEN the system SHALL handle errors gracefully and return meaningful messages
5. WHEN errors are thrown THEN the system SHALL maintain the same error response format as the original ORPC implementation

### Requirement 5: Type Safety

**User Story:** As a backend developer, I want full TypeScript type safety across all endpoints, so that type errors are caught at compile time.

#### Acceptance Criteria

1. WHEN defining routes THEN the system SHALL use Zod schemas for input validation
2. WHEN defining routes THEN the system SHALL use Zod schemas for response validation
3. WHEN route parameters exist THEN the system SHALL validate them using Zod schemas
4. WHEN query parameters exist THEN the system SHALL validate them using Zod schemas
5. WHEN request bodies exist THEN the system SHALL validate them using Zod schemas

### Requirement 6: Code Organization

**User Story:** As a backend developer, I want a consistent code organization pattern, so that the codebase is maintainable and scalable.

#### Acceptance Criteria

1. WHEN a router has fewer than 200 lines THEN the system SHALL use a single `index.ts` file
2. WHEN a router has more than 200 lines THEN the system SHALL split into `schemas.ts`, `routes.ts`, and `service.ts` files
3. WHEN multiple related routers exist THEN the system SHALL group them in a domain directory
4. WHEN helper functions are needed THEN the system SHALL place them in a `utils.ts` or `helpers.ts` file
5. WHEN error definitions are needed THEN the system SHALL place them in an `errors.ts` file

### Requirement 7: Database Operations

**User Story:** As a backend developer, I want database operations to remain unchanged, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN database queries exist THEN the system SHALL preserve all Drizzle ORM queries
2. WHEN transactions are used THEN the system SHALL maintain transaction boundaries
3. WHEN relations are queried THEN the system SHALL preserve all `with` clauses for eager loading
4. WHEN database errors occur THEN the system SHALL handle them appropriately
5. WHEN database operations complete THEN the system SHALL return data in the same format

### Requirement 8: Real-time Integration

**User Story:** As a backend developer, I want real-time functionality to continue working, so that live updates are maintained.

#### Acceptance Criteria

1. WHEN real-time updates are needed THEN the system SHALL preserve Centrifugo integration
2. WHEN publishing events THEN the system SHALL maintain the same channel naming conventions
3. WHEN subscribing to channels THEN the system SHALL preserve subscription logic
4. WHEN real-time tokens are generated THEN the system SHALL use the existing token generation logic
5. WHEN real-time connections fail THEN the system SHALL handle errors gracefully

### Requirement 9: API Documentation

**User Story:** As a backend developer, I want API documentation to be automatically generated, so that endpoints are well-documented.

#### Acceptance Criteria

1. WHEN routes are defined THEN the system SHALL include OpenAPI metadata (description, summary, tags)
2. WHEN the server starts THEN the system SHALL expose OpenAPI documentation via the `/swagger` endpoint
3. WHEN schemas are defined THEN the system SHALL include descriptions for fields
4. WHEN responses are defined THEN the system SHALL document all possible response types
5. WHEN errors are defined THEN the system SHALL document all possible error responses

### Requirement 10: Testing Compatibility

**User Story:** As a backend developer, I want existing tests to continue working with minimal changes, so that test coverage is maintained.

#### Acceptance Criteria

1. WHEN endpoints are migrated THEN the system SHALL maintain the same request/response contracts
2. WHEN test clients are used THEN the system SHALL support the same HTTP methods
3. WHEN authentication is tested THEN the system SHALL work with existing auth test utilities
4. WHEN database fixtures are used THEN the system SHALL work with existing test data
5. WHEN integration tests run THEN the system SHALL pass all existing test cases

### Requirement 11: Performance

**User Story:** As a backend developer, I want the migrated API to maintain or improve performance, so that response times are acceptable.

#### Acceptance Criteria

1. WHEN handling requests THEN the system SHALL maintain response times within 10% of current performance
2. WHEN validating schemas THEN the system SHALL use efficient Zod validation
3. WHEN querying databases THEN the system SHALL maintain existing query optimization
4. WHEN handling concurrent requests THEN the system SHALL scale similarly to the current implementation
5. WHEN memory is used THEN the system SHALL not increase memory footprint significantly

### Requirement 12: Backward Compatibility

**User Story:** As a frontend developer, I want the API to maintain backward compatibility, so that existing clients continue to work.

#### Acceptance Criteria

1. WHEN clients make requests THEN the system SHALL accept the same request formats
2. WHEN responses are returned THEN the system SHALL maintain the same response structures
3. WHEN errors occur THEN the system SHALL return the same error formats
4. WHEN authentication is used THEN the system SHALL accept the same authentication methods
5. WHEN API versions exist THEN the system SHALL maintain version compatibility

### Requirement 13: Migration Verification

**User Story:** As a backend developer, I want to verify that each migrated endpoint works correctly, so that no functionality is lost.

#### Acceptance Criteria

1. WHEN an endpoint is migrated THEN the system SHALL compile without TypeScript errors
2. WHEN the server starts THEN the system SHALL load all migrated routes successfully
3. WHEN endpoints are called THEN the system SHALL return expected responses
4. WHEN validation fails THEN the system SHALL return appropriate error messages
5. WHEN all endpoints are migrated THEN the system SHALL remove all ORPC dependencies

### Requirement 14: Logging and Monitoring

**User Story:** As a backend developer, I want consistent logging across all endpoints, so that debugging is easier.

#### Acceptance Criteria

1. WHEN requests are received THEN the system SHALL log request details using the existing logger
2. WHEN errors occur THEN the system SHALL log error details with stack traces
3. WHEN database queries execute THEN the system SHALL maintain existing query logging
4. WHEN authentication fails THEN the system SHALL log authentication failures
5. WHEN the server starts THEN the system SHALL log startup information

### Requirement 15: Environment Configuration

**User Story:** As a backend developer, I want environment configuration to remain consistent, so that deployment is not affected.

#### Acceptance Criteria

1. WHEN the server starts THEN the system SHALL use the existing `env` configuration
2. WHEN CORS is configured THEN the system SHALL use the existing CORS settings
3. WHEN ports are configured THEN the system SHALL use the existing port configuration
4. WHEN database connections are made THEN the system SHALL use the existing connection settings
5. WHEN external services are accessed THEN the system SHALL use the existing service configurations
