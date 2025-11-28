# Design Document

## Overview

The Academic Profile system provides a comprehensive solution for students to track their educational journey across multiple institutions. The system is built on a flexible, modular architecture that supports various educational contexts (universities, high schools, online courses) while maintaining the capability to evolve into a full Learning Management System (LMS).

The design follows Rovierr's architecture using:
- **Database**: Drizzle ORM with PostgreSQL (via Neon)
- **API Layer**: ORPC for type-safe client-server communication
- **Backend**: Bun + Hono server
- **Frontend**: Next.js with React Query for data fetching

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  (Next.js App Router + React Query + ORPC Client)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ ORPC Contract
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (ORPC)                        │
│              Type-safe contracts with Zod                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer (Hono)                      │
│              Business Logic + Authorization                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer (Drizzle)                    │
│                    PostgreSQL via Neon                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → Frontend component triggers action
2. **ORPC Call** → Type-safe API call via React Query
3. **Authorization** → Protected procedure validates user session
4. **Business Logic** → Server processes request, validates data
5. **Database Operation** → Drizzle ORM executes queries
6. **Response** → Type-safe response flows back to frontend

## Components and Interfaces

### Database Schema Refactoring

The existing demo schemas need to be refactored to support the academic profile requirements:

#### Changes to Existing Files

**1. Rename `university.ts` → `institution.ts`**
- Expand to support multiple institution types (university, high_school, online, bootcamp)
- Add `type` field and `domain` field
- Keep existing fields: name, logo, country, city, validEmailDomains

**2. Refactor `program.ts`**
- Keep as-is but rename references from `university` to `institution`
- This represents degree programs at institutions

**3. Refactor `semester.ts` → `academic-term.ts`**
- Rename to be more generic (supports semesters, years, terms, modules)
- Remove `userSemester` table (will be replaced by journey-based structure)

**4. Refactor `course.ts`**
- Simplify to master course catalog
- Remove `semesterCourse`, `section`, `userCourseEnrollment` tables
- Keep core course definition with institution reference

#### New Schema Files

**5. Create `academic-journey.ts`**
- Represents a user's educational track at an institution
- Links user → institution → program
- Tracks cumulative GPA and total credits

**6. Create `academic-term-enrollment.ts`**
- Connects journey → academic term
- Stores term-specific GPA

**7. Create `course-enrollment.ts`**
- Connects term enrollment → course
- Stores grade, credits, grade points, status

**8. Create `achievement.ts`**
- Stores awards, scholarships, competitions, certificates
- Links to academic journey

### ORPC Contracts

New contract namespace: `user.academic`

**Endpoints:**
- `user.academic.journeys.list` - Get all journeys for user
- `user.academic.journeys.create` - Create new journey
- `user.academic.journeys.update` - Update journey details
- `user.academic.journeys.delete` - Delete journey and all related data
- `user.academic.terms.list` - Get terms for a journey
- `user.academic.terms.create` - Create new term
- `user.academic.terms.update` - Update term
- `user.academic.terms.delete` - Delete term
- `user.academic.enrollments.list` - Get course enrollments for a term
- `user.academic.enrollments.create` - Add course to term
- `user.academic.enrollments.update` - Update grade/status
- `user.academic.enrollments.delete` - Remove enrollment
- `user.academic.achievements.list` - Get achievements for journey
- `user.academic.achievements.create` - Add achievement
- `user.academic.achievements.update` - Update achievement
- `user.academic.achievements.delete` - Delete achievement
- `user.academic.timeline` - Get complete timeline view

## Data Models

### 1. Institution (refactored from University)

```typescript
export const institution = pgTable('institution', {
  id: primaryId,
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  type: text('type').notNull(), // 'university' | 'high_school' | 'online' | 'bootcamp' | 'other'
  logo: text('logo'),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address'),
  domain: text('domain'), // e.g., 'cuhk.edu.hk'
  validEmailDomains: text('valid_email_domains').array().notNull(),
  ...timestamps
})
```

### 2. Course (simplified)

```typescript
export const course = pgTable('course', {
  id: primaryId,
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  code: text('code').notNull(), // e.g., 'CSCI2100'
  title: text('title').notNull(),
  description: text('description'),
  defaultCredits: text('default_credits'), // e.g., '3' or '4'
  department: text('department'),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  isVerified: boolean('is_verified').default(false),
  ...timestamps
})
```

### 3. Academic Journey (new)

```typescript
export const academicJourney = pgTable('academic_journey', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  programName: text('program_name').notNull(), // e.g., 'Bachelor of Engineering'
  level: text('level').notNull(), // e.g., 'University', 'A-Level', 'IGCSE'
  startDate: date('start_date'),
  endDate: date('end_date'),
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed'
  cumulativeGpa: text('cumulative_gpa'), // stored as string for precision
  totalCredits: text('total_credits'),
  ...timestamps
})
```

### 4. Academic Term (refactored from Semester)

```typescript
export const academicTerm = pgTable('academic_term', {
  id: primaryId,
  journeyId: text('journey_id')
    .notNull()
    .references(() => academicJourney.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., 'Year 1 Semester 2', 'Fall 2024', 'Grade 12'
  startDate: date('start_date'),
  endDate: date('end_date'),
  gpa: text('gpa'), // term GPA
  ...timestamps
})
```

### 5. Course Enrollment (new)

```typescript
export const courseEnrollment = pgTable('course_enrollment', {
  id: primaryId,
  termId: text('term_id')
    .notNull()
    .references(() => academicTerm.id, { onDelete: 'cascade' }),
  courseId: text('course_id')
    .notNull()
    .references(() => course.id, { onDelete: 'cascade' }),
  credits: text('credits').notNull(),
  grade: text('grade'), // e.g., 'A', 'A-', 'B+'
  gradePoints: text('grade_points'), // e.g., '4.0', '3.7'
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed' | 'withdrawn'
  ...timestamps
})
```

### 6. Achievement (new)

```typescript
export const achievement = pgTable('achievement', {
  id: primaryId,
  journeyId: text('journey_id')
    .notNull()
    .references(() => academicJourney.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  dateAwarded: date('date_awarded').notNull(),
  type: text('type').notNull(), // 'award' | 'competition' | 'scholarship' | 'certificate'
  ...timestamps
})
```

### Entity Relationship Diagram

```
user
  └── academicJourney
        ├── institution
        ├── academicTerm
        │     └── courseEnrollment
        │           └── course
        └── achievement
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Journey Management Properties

**Property 1: Journey creation stores all required fields**
*For any* valid journey data (institution, program name, level, dates, status), creating a journey should result in all fields being stored and retrievable from the database.
**Validates: Requirements 1.1**

**Property 2: User journey retrieval completeness**
*For any* user with multiple journeys, querying their journeys should return all journeys associated with that user.
**Validates: Requirements 1.2**

**Property 3: Journey GPA independence**
*For any* user with multiple journeys, the GPA calculation for one journey should not affect the GPA of another journey.
**Validates: Requirements 1.3**

**Property 4: Journey completion preserves data**
*For any* journey with terms and enrollments, updating the status to "completed" should preserve all associated terms, enrollments, and achievements.
**Validates: Requirements 1.4**

**Property 5: In-progress journeys accept new data**
*For any* journey with status "in_progress", adding new terms and courses should succeed.
**Validates: Requirements 1.5**

### Term Management Properties

**Property 6: Term creation stores all required fields**
*For any* valid term data (journey, name, dates, GPA), creating a term should result in all fields being stored and the term being associated with the correct journey.
**Validates: Requirements 2.1**

**Property 7: Terms are ordered chronologically**
*For any* journey with multiple terms, querying the terms should return them ordered by start date in ascending order.
**Validates: Requirements 2.2**

**Property 8: Term GPA calculation accuracy**
*For any* term with completed course enrollments, the term GPA should equal sum(grade_points × credits) / sum(credits) for all completed courses.
**Validates: Requirements 2.3, 8.3**

**Property 9: Cascading GPA recalculation**
*For any* journey, when a term's GPA changes (due to grade updates or enrollment changes), the journey's cumulative GPA should be recalculated automatically.
**Validates: Requirements 2.4, 8.1, 8.2**

### Course Enrollment Properties

**Property 10: Enrollment creation stores all required fields**
*For any* valid enrollment data (term, course, credits, grade, status), creating an enrollment should result in all fields being stored.
**Validates: Requirements 3.1**

**Property 11: Grade validation and grade point calculation**
*For any* valid grade (A, A-, B+, etc.), the system should accept it and calculate the correct grade points; for any invalid grade format, the system should reject it.
**Validates: Requirements 3.2**

**Property 12: Course status affects GPA inclusion**
*For any* term, only enrollments with status "completed" should be included in GPA calculations; enrollments with status "withdrawn" or "in_progress" should be excluded.
**Validates: Requirements 3.3, 3.4, 8.4**

**Property 13: In-progress courses are mutable**
*For any* enrollment with status "in_progress", updating the grade or status should succeed.
**Validates: Requirements 3.5**

### Achievement Properties

**Property 14: Achievement creation stores all required fields**
*For any* valid achievement data (journey, title, description, date, type), creating an achievement should result in all fields being stored.
**Validates: Requirements 4.1**

**Property 15: Achievement retrieval completeness**
*For any* journey with multiple achievements, querying achievements should return all achievements associated with that journey.
**Validates: Requirements 4.2**

**Property 16: Achievement type flexibility**
*For any* achievement type (award, competition, scholarship, certificate), the system should accept and store it correctly.
**Validates: Requirements 4.3**

**Property 17: Achievements ordered by date**
*For any* journey with multiple achievements, querying achievements should return them ordered by date awarded in descending order (most recent first).
**Validates: Requirements 4.4**

### Timeline and Data Retrieval Properties

**Property 18: Complete timeline structure**
*For any* user, querying the academic timeline should return all journeys with their nested terms (in chronological order) and all associated data (enrollments, achievements).
**Validates: Requirements 5.1, 5.2, 10.2**

**Property 19: Term data completeness**
*For any* term in the timeline, the response should include term name, date range, GPA, all enrolled courses with their details (code, title, grade, credits), and associated achievements.
**Validates: Requirements 5.2, 5.3**

**Property 20: Timeline hierarchical grouping**
*For any* timeline response, data should be grouped by journey at the top level, then by term within each journey, then by enrollments within each term.
**Validates: Requirements 5.4**

### Institution and Course Catalog Properties

**Property 21: Institution creation stores all required fields**
*For any* valid institution data (name, type, country, logo, domain), creating an institution should result in all fields being stored.
**Validates: Requirements 6.1**

**Property 22: Course creation with institution association**
*For any* valid course data with an institution reference, creating a course should result in all fields being stored and the course being associated with the correct institution.
**Validates: Requirements 6.2**

**Property 23: Enrollment referential integrity**
*For any* enrollment, the referenced course must exist and belong to the same institution as the journey's institution.
**Validates: Requirements 6.3**

**Property 24: Institution filtering by type**
*For any* institution type filter (university, high_school, online, other), querying institutions should return only institutions matching that type.
**Validates: Requirements 6.4**

**Property 25: User course creation**
*For any* user with valid course data, creating a custom course should succeed and the course should be marked as user-created.
**Validates: Requirements 6.5**

### Data Modification Properties

**Property 26: Journey update with recalculation**
*For any* journey, updating journey information should save the changes and trigger recalculation of dependent metrics (cumulative GPA).
**Validates: Requirements 9.1**

**Property 27: Cascading deletion with recalculation**
*For any* term or enrollment deletion, all associated data should be removed and affected GPAs (term and journey) should be recalculated.
**Validates: Requirements 9.2, 9.3**

**Property 28: Achievement deletion isolation**
*For any* achievement deletion, only the achievement should be removed; all other journey data (terms, enrollments, GPA) should remain unchanged.
**Validates: Requirements 9.4**

**Property 29: Journey cascading deletion**
*For any* journey deletion, all associated terms, enrollments, and achievements should be removed from the database.
**Validates: Requirements 9.5**

### Authorization and Privacy Properties

**Property 30: Data ownership association**
*For any* academic data created by a user (journey, term, enrollment, achievement), the data should be associated with that user's account.
**Validates: Requirements 10.1**

**Property 31: Authorization denial for non-owners**
*For any* user attempting to access another user's academic data, the system should deny access unless explicitly authorized.
**Validates: Requirements 10.3, 10.4**

### Edge Cases

**Edge Case 1: Empty term GPA handling**
*For any* term with no completed courses, the term GPA should be null or zero.
**Validates: Requirements 8.5**


## Error Handling

### Error Types

**1. Validation Errors**
- Invalid grade format
- Invalid GPA values (negative, > 4.0)
- Invalid dates (end before start)
- Missing required fields
- Invalid enum values (status, type)

**2. Authorization Errors**
- User not authenticated
- User attempting to access another user's data
- User attempting to modify data they don't own

**3. Referential Integrity Errors**
- Institution not found
- Course not found
- Journey not found
- Term not found
- Course doesn't belong to journey's institution

**4. Business Logic Errors**
- Cannot add terms to completed journey
- Cannot modify completed enrollments
- Cannot delete journey with active terms (without confirmation)
- GPA calculation errors (division by zero)

### Error Response Format

All ORPC endpoints will use standardized error responses:

```typescript
{
  code: 'ERROR_CODE',
  data: {
    message: 'Human-readable error message',
    field?: 'fieldName', // for validation errors
    details?: {} // additional context
  }
}
```

### Error Codes

- `UNAUTHORIZED` - User not authenticated or not authorized
- `NOT_FOUND` - Resource not found
- `INVALID_INPUT` - Validation failed
- `REFERENTIAL_INTEGRITY` - Foreign key constraint violation
- `BUSINESS_LOGIC_ERROR` - Business rule violation
- `CALCULATION_ERROR` - GPA calculation failed

## Testing Strategy

### Dual Testing Approach

The academic profile system will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** will cover:
- Specific examples of GPA calculations
- Edge cases (empty terms, withdrawn courses)
- Error conditions (invalid grades, missing data)
- Authorization checks for specific scenarios
- Database cascade operations

**Property-Based Tests** will verify:
- Universal properties that should hold across all inputs
- GPA calculation correctness for random course combinations
- Data integrity across random CRUD operations
- Authorization rules for any user/data combination

### Property-Based Testing Framework

**Framework**: We will use **fast-check** for TypeScript property-based testing.

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Tagging**: Each property-based test will be tagged with a comment explicitly referencing the correctness property from this design document using the format:
```typescript
// Feature: academic-profile, Property 8: Term GPA calculation accuracy
```

### Test Organization

```
apps/server/src/routers/user/academic/
  ├── __tests__/
  │   ├── journeys.test.ts          # Unit tests for journey endpoints
  │   ├── journeys.property.test.ts # Property tests for journeys
  │   ├── terms.test.ts
  │   ├── terms.property.test.ts
  │   ├── enrollments.test.ts
  │   ├── enrollments.property.test.ts
  │   ├── achievements.test.ts
  │   ├── achievements.property.test.ts
  │   ├── timeline.test.ts
  │   ├── timeline.property.test.ts
  │   └── gpa-calculation.property.test.ts # Dedicated GPA tests
```

### Key Test Scenarios

**Unit Tests:**
1. Create journey with valid data → success
2. Create journey with missing fields → validation error
3. Calculate GPA with known grades → correct result
4. Delete journey → cascades to terms and enrollments
5. Access another user's data → authorization error
6. Update grade → term and journey GPA recalculate

**Property-Based Tests:**
1. For any valid journey data, creation succeeds and all fields are retrievable
2. For any set of courses with grades, GPA calculation follows the formula
3. For any term deletion, journey GPA updates correctly
4. For any user, they can only access their own data
5. For any journey with terms, chronological ordering is maintained
6. For any enrollment status change, GPA inclusion rules are followed

### Test Data Generators

Property-based tests will use custom generators for:
- Random institutions (various types)
- Random journeys (various statuses, dates)
- Random terms (various names, dates)
- Random courses (various codes, credits)
- Random enrollments (various grades, statuses)
- Random achievements (various types, dates)
- Random users (for authorization tests)

### GPA Calculation Testing

Special attention will be paid to GPA calculations:

**Unit Tests:**
- Known grade combinations (e.g., A=4.0, B+=3.3)
- Edge cases (all same grade, all different grades)
- Withdrawn courses excluded
- In-progress courses excluded
- Empty terms (no completed courses)

**Property Tests:**
- For any set of completed courses, GPA = sum(points × credits) / sum(credits)
- For any term with withdrawn courses, they don't affect GPA
- For any journey, cumulative GPA = weighted average of term GPAs
- For any grade update, GPA recalculates correctly

## Implementation Notes

### Database Migrations

The implementation will require:
1. Renaming `university` table to `institution` with new fields
2. Creating new tables: `academic_journey`, `academic_term`, `course_enrollment`, `achievement`
3. Dropping old tables: `semester`, `user_semester`, `semester_course`, `section`, `user_course_enrollment`
4. Updating foreign key references in `course` and `program` tables

### GPA Calculation Service

A dedicated service will handle GPA calculations:

```typescript
class GPACalculator {
  calculateTermGPA(enrollments: Enrollment[]): string | null
  calculateJourneyGPA(terms: Term[]): string | null
  gradeToPoints(grade: string): number
  validateGrade(grade: string): boolean
}
```

### Authorization Middleware

All academic endpoints will use a middleware to verify:
1. User is authenticated
2. User owns the academic data being accessed/modified
3. User has permission for the operation (read/write/delete)

### Caching Strategy

For performance:
- Cache institution and course catalogs (rarely change)
- Invalidate user timeline cache on any academic data change
- Use React Query's built-in caching on frontend

### Real-time Updates

Future consideration: Use Centrifugo to push GPA updates to connected clients when grades are entered by instructors (LMS feature).

## API Endpoint Summary

### Journey Endpoints
- `GET /user/academic/journeys/list` - List all journeys for current user
- `POST /user/academic/journeys/create` - Create new journey
- `PATCH /user/academic/journeys/:id/update` - Update journey
- `DELETE /user/academic/journeys/:id/delete` - Delete journey

### Term Endpoints
- `GET /user/academic/terms/list?journeyId=:id` - List terms for journey
- `POST /user/academic/terms/create` - Create new term
- `PATCH /user/academic/terms/:id/update` - Update term
- `DELETE /user/academic/terms/:id/delete` - Delete term

### Enrollment Endpoints
- `GET /user/academic/enrollments/list?termId=:id` - List enrollments for term
- `POST /user/academic/enrollments/create` - Create enrollment
- `PATCH /user/academic/enrollments/:id/update` - Update enrollment (grade/status)
- `DELETE /user/academic/enrollments/:id/delete` - Delete enrollment

### Achievement Endpoints
- `GET /user/academic/achievements/list?journeyId=:id` - List achievements for journey
- `POST /user/academic/achievements/create` - Create achievement
- `PATCH /user/academic/achievements/:id/update` - Update achievement
- `DELETE /user/academic/achievements/:id/delete` - Delete achievement

### Timeline Endpoint
- `GET /user/academic/timeline` - Get complete academic timeline with all nested data

### Institution & Course Endpoints (Admin/Public)
- `GET /institutions/list?type=:type` - List institutions with optional type filter
- `GET /institutions/:id/courses` - List courses for institution
- `POST /courses/create` - Create custom course (user-created)

## Frontend Components

### Page Structure

```
/profile/academic
  ├── Timeline View (default)
  │   └── Journey Cards
  │       ├── Journey Header (institution, program, dates, GPA)
  │       └── Term Cards
  │           ├── Term Header (name, dates, GPA)
  │           ├── Course List (code, title, grade, credits)
  │           └── Achievement Badges
  │
  ├── Add Journey Modal
  ├── Add Term Modal
  ├── Add Course Modal
  └── Add Achievement Modal
```

### Key Components

1. **AcademicTimeline** - Main container, fetches and displays all data
2. **JourneyCard** - Displays single journey with nested terms
3. **TermCard** - Displays single term with courses and achievements
4. **CourseRow** - Displays single course enrollment
5. **AchievementBadge** - Displays single achievement
6. **GPADisplay** - Formatted GPA display with color coding
7. **AddJourneyForm** - Form to create new journey (TanStack Form)
8. **AddTermForm** - Form to create new term
9. **AddCourseForm** - Form to add course to term
10. **AddAchievementForm** - Form to add achievement

### Data Fetching Pattern

```typescript
// Timeline query
const { data: timeline } = useQuery(
  orpc.user.academic.timeline.queryOptions()
)

// Add enrollment mutation
const addEnrollment = useMutation(
  orpc.user.academic.enrollments.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'academic', 'timeline'] })
      toast.success('Course added successfully')
    }
  })
)
```

## Future LMS Extensions

The data model is designed to support future LMS features without breaking changes:

### Potential Extensions

1. **Course Offerings Table**
   - Links courses to specific terms with instructors
   - Supports multiple sections per course
   - Stores syllabus, schedule, enrollment limits

2. **Assignments & Submissions**
   - Assignment table linked to course offerings
   - Submission table linked to user enrollments
   - Grading rubrics and feedback

3. **Materials & Resources**
   - Course materials (slides, readings, videos)
   - Resource library per course
   - Access control and versioning

4. **Attendance Tracking**
   - Session table for course meetings
   - Attendance records per user per session
   - Attendance policies and reporting

5. **Discussion Forums**
   - Forum threads per course
   - Posts and replies
   - Moderation and notifications

### Migration Path

When adding LMS features:
1. Create new tables (don't modify existing academic profile tables)
2. Link via foreign keys to existing tables (course, enrollment)
3. Use separate ORPC contract namespace (e.g., `lms.*`)
4. Maintain backward compatibility for academic profile APIs

## Performance Considerations

### Database Indexes

Required indexes for optimal performance:
- `academic_journey(user_id)` - Fast user journey lookup
- `academic_term(journey_id, start_date)` - Chronological term queries
- `course_enrollment(term_id)` - Fast enrollment lookup
- `achievement(journey_id, date_awarded)` - Ordered achievement queries
- `course(institution_id, code)` - Course catalog searches
- `institution(type, country)` - Institution filtering

### Query Optimization

- Use Drizzle's query builder for efficient joins
- Fetch timeline data in single query with nested joins
- Implement pagination for large course catalogs
- Cache institution and course data on frontend

### Scalability

- GPA calculations are lightweight (simple arithmetic)
- Timeline queries scale linearly with user data
- No N+1 query problems (use proper joins)
- Database cascade deletes handle cleanup efficiently

## Security Considerations

### Authorization

- All endpoints require authentication
- Row-level security: users can only access their own data
- Admin endpoints (institution/course management) require elevated permissions
- API rate limiting to prevent abuse

### Data Validation

- Strict Zod schemas for all inputs
- Grade format validation (A, A-, B+, etc.)
- Date validation (end after start)
- GPA bounds checking (0.0 - 4.0)
- SQL injection prevention (Drizzle ORM parameterized queries)

### Privacy

- Academic data is private by default
- No public endpoints for viewing other users' academic data
- Future sharing features will require explicit opt-in
- Audit logging for sensitive operations (grade changes, deletions)

## Deployment Considerations

### Database Migrations

Use Drizzle Kit for migrations:
```bash
bun run drizzle-kit generate
bun run drizzle-kit migrate
```

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - For authentication

### Rollout Strategy

1. Deploy database migrations (backward compatible)
2. Deploy backend API (new endpoints)
3. Deploy frontend (new pages/components)
4. Gradual rollout to users
5. Monitor error rates and performance

### Rollback Plan

- Database migrations are reversible
- Feature flags for frontend components
- API versioning for breaking changes
- Database backups before major migrations
