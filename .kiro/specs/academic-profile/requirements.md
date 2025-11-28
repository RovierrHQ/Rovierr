# Requirements Document

## Introduction

The Academic Profile system enables university students to maintain a comprehensive record of their educational journey across multiple institutions and programs. The system supports tracking academic terms, courses, grades, achievements, and cumulative performance metrics. It is designed to be modular and extensible, with the capability to evolve into a full Learning Management System (LMS) in the future.

## Glossary

- **Academic Journey**: A single educational track at a specific institution (e.g., Bachelor's degree at CUHK, A-Levels at Victoria International School)
- **Institution**: An educational organization including universities, high schools, bootcamps, or online platforms
- **Academic Term**: A time-bound period within a journey (e.g., "Year 1 Semester 2", "Fall 2024", "Grade 13")
- **Course**: A specific class or subject offered by an institution
- **Enrollment**: The connection between a user, term, and course, including grade and credit information
- **Achievement**: Any award, recognition, or milestone earned by a user (e.g., Dean's List, scholarships, competition wins)
- **GPA**: Grade Point Average, calculated per term and cumulatively across a journey
- **System**: The Rovierr Academic Profile system

## Requirements

### Requirement 1

**User Story:** As a university student, I want to create multiple academic journeys for different educational experiences, so that I can maintain a complete record of my education across institutions.

#### Acceptance Criteria

1. WHEN a user creates an academic journey THEN the System SHALL store the institution, program name, level, start date, end date, and status
2. WHEN a user views their profile THEN the System SHALL display all academic journeys associated with that user
3. WHEN a user has multiple journeys THEN the System SHALL allow each journey to have independent GPA calculations and credit totals
4. WHEN a user updates a journey status to completed THEN the System SHALL preserve all historical data for that journey
5. WHERE a journey is in progress, the System SHALL allow the user to add new terms and courses

### Requirement 2

**User Story:** As a student, I want to organize my courses by academic terms, so that I can track my performance across different semesters or years.

#### Acceptance Criteria

1. WHEN a user creates an academic term THEN the System SHALL associate it with a specific journey and store the term name, start date, end date, and GPA
2. WHEN a user views a journey THEN the System SHALL display all terms in chronological order
3. WHEN courses are added to a term THEN the System SHALL calculate the term GPA based on enrolled courses
4. WHEN a term is completed THEN the System SHALL update the cumulative GPA for the parent journey
5. WHERE multiple terms exist in a journey, the System SHALL support flexible naming conventions (e.g., "Semester 1", "Fall 2024", "Grade 12")

### Requirement 3

**User Story:** As a student, I want to record my course enrollments with grades and credits, so that I can track my academic performance in detail.

#### Acceptance Criteria

1. WHEN a user enrolls in a course for a term THEN the System SHALL store the course reference, credits, grade, grade points, and status
2. WHEN a user enters a grade for a course THEN the System SHALL validate the grade format and calculate corresponding grade points
3. WHEN a course status is set to completed THEN the System SHALL include it in GPA calculations
4. WHEN a course status is set to withdrawn THEN the System SHALL exclude it from GPA calculations
5. WHERE a course is in progress, the System SHALL allow the user to update the grade and status

### Requirement 4

**User Story:** As a student, I want to add achievements to my academic journey, so that I can showcase awards, scholarships, and recognitions I have earned.

#### Acceptance Criteria

1. WHEN a user creates an achievement THEN the System SHALL store the title, description, date awarded, and type
2. WHEN a user views a journey THEN the System SHALL display all achievements associated with that journey
3. WHEN an achievement is created THEN the System SHALL support multiple types including awards, competitions, scholarships, and certificates
4. WHEN achievements are displayed THEN the System SHALL order them by date awarded in descending order
5. WHERE an achievement is associated with a specific term, the System SHALL display it alongside that term's information

### Requirement 5

**User Story:** As a student, I want to view my academic timeline with terms, courses, and achievements organized chronologically, so that I can see my educational progress at a glance.

#### Acceptance Criteria

1. WHEN a user views their academic profile THEN the System SHALL display all journeys with their terms in chronological order
2. WHEN a term is displayed THEN the System SHALL show the term name, date range, GPA, enrolled courses with grades, and associated achievements
3. WHEN courses are displayed within a term THEN the System SHALL show the course code, title, grade, and credits
4. WHEN the timeline is rendered THEN the System SHALL group content by journey and then by term within each journey
5. WHERE a journey has a cumulative GPA, the System SHALL display it prominently at the journey level

### Requirement 6

**User Story:** As a system administrator, I want to maintain a master list of institutions and courses, so that students can select from standardized options when creating their profiles.

#### Acceptance Criteria

1. WHEN an institution is created THEN the System SHALL store the name, type, country, logo, and domain
2. WHEN a course is created THEN the System SHALL associate it with an institution and store the code, title, description, default credits, and department
3. WHEN a user creates an enrollment THEN the System SHALL allow selection from existing courses at the relevant institution
4. WHEN institutions are listed THEN the System SHALL support filtering by type (university, high school, online, other)
5. WHERE a course does not exist in the master list, the System SHALL allow users to create custom course entries

### Requirement 7

**User Story:** As a developer, I want the data model to support future LMS features, so that the system can evolve without requiring major restructuring.

#### Acceptance Criteria

1. WHEN the database schema is designed THEN the System SHALL separate academic identity data from potential LMS features
2. WHEN courses are stored THEN the System SHALL use a structure that can accommodate course offerings, instructors, and syllabi
3. WHEN the data model is extended THEN the System SHALL allow addition of assignments, submissions, and quizzes without modifying core academic profile tables
4. WHEN relationships are defined THEN the System SHALL use foreign keys that support both current features and future LMS capabilities
5. WHERE LMS features are added, the System SHALL maintain backward compatibility with existing academic profile data

### Requirement 8

**User Story:** As a student, I want my GPA to be calculated automatically based on my course grades, so that I always have accurate performance metrics.

#### Acceptance Criteria

1. WHEN a course grade is entered or updated THEN the System SHALL recalculate the term GPA for that academic term
2. WHEN a term GPA changes THEN the System SHALL recalculate the cumulative GPA for the parent journey
3. WHEN calculating GPA THEN the System SHALL use the formula: sum(grade_points × credits) / sum(credits) for completed courses only
4. WHEN a course is marked as withdrawn THEN the System SHALL exclude it from all GPA calculations
5. WHERE no completed courses exist in a term, the System SHALL display the term GPA as null or zero

### Requirement 9

**User Story:** As a student, I want to edit or delete my academic data, so that I can correct mistakes or remove outdated information.

#### Acceptance Criteria

1. WHEN a user updates journey information THEN the System SHALL save the changes and recalculate dependent metrics
2. WHEN a user deletes a term THEN the System SHALL remove all associated enrollments and recalculate the journey GPA
3. WHEN a user deletes an enrollment THEN the System SHALL recalculate the term GPA and journey GPA
4. WHEN a user deletes an achievement THEN the System SHALL remove it from the journey without affecting other data
5. WHERE a user attempts to delete a journey, the System SHALL prompt for confirmation and remove all associated terms, enrollments, and achievements

### Requirement 10

**User Story:** As a student, I want my academic profile to be private by default, so that my educational information is only visible to me unless I choose to share it.

#### Acceptance Criteria

1. WHEN a user creates academic data THEN the System SHALL associate it with their user account and restrict access to that user
2. WHEN a user views their profile THEN the System SHALL display all their academic journeys, terms, courses, and achievements
3. WHEN another user attempts to access academic data THEN the System SHALL deny access unless explicitly authorized
4. WHEN the System performs authorization checks THEN the System SHALL verify the requesting user owns the academic data
5. WHERE future sharing features are added, the System SHALL maintain privacy controls at the journey or profile level
