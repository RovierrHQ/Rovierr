# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create `packages/db/src/seed/` directory structure
  - Create `packages/db/src/web-scraper/` directory structure
  - Add required dependencies to `packages/db/package.json` (commander, chalk, ora, cheerio, p-limit)
  - Add dev dependencies (fast-check, vitest, @types/cheerio)
  - Add npm scripts for seeding commands
  - _Requirements: All requirements depend on proper setup_

- [x] 2. Implement core type definitions and interfaces
  - Create `seed/types.ts` with SeedModule, SeedOptions, SeedResult, and SeedSummary interfaces
  - Create `web-scraper/types.ts` with scraper interfaces and configuration types
  - Define error types (SeedError, DependencyError, ValidationError)
  - _Requirements: 2.2, 2.3_

- [-] 3. Implement CLI argument parser
  - Create `seed/utils/cli.ts` with argument parsing logic
  - Implement support for `--only`, `--exclude`, `--clear`, `--dry-run`, `--verbose`, `--no-transaction`, `--force` flags
  - Implement help text generation
  - Implement list available seeds command
  - _Requirements: 1.1, 1.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.1 Write property test for CLI flag parsing
  - **Property 3: CLI Only Flag Filtering**
  - **Property 4: CLI Exclude Flag Filtering**
  - **Validates: Requirements 1.1, 5.1, 5.2**

- [-] 4. Implement dependency resolver
  - Create `seed/utils/dependency.ts` with topological sort algorithm
  - Implement circular dependency detection
  - Implement missing dependency detection
  - Generate execution order based on dependency graph
  - _Requirements: 1.2, 1.4, 2.3, 7.1_

- [ ] 4.1 Write property test for dependency ordering
  - **Property 1: Dependency Order Preservation**
  - **Validates: Requirements 1.2, 1.4, 2.3, 7.1**

- [-] 5. Implement seed module registry
  - Create `seed/registry.ts` with module discovery logic
  - Implement automatic module detection from `seed/modules/` directory
  - Implement module registration and validation
  - Build dependency graph from registered modules
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 5.1 Write property test for module auto-discovery
  - **Property 9: Module Auto-Discovery**
  - **Property 10: Seed Function Execution**
  - **Validates: Requirements 2.1, 2.2, 2.4**

- [-] 6. Implement transaction manager
  - Create `seed/utils/transaction.ts` with transaction wrapping logic
  - Implement transaction begin, commit, and rollback
  - Implement no-transaction mode
  - Add transaction error handling and logging
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6.1 Write property test for transaction atomicity
  - **Property 2: Transaction Atomicity**
  - **Property 16: Transaction Disabled Mode**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [-] 7. Implement logger utility
  - Create `seed/utils/logger.ts` with logging functions
  - Implement log levels (info, warn, error, debug, success)
  - Implement verbose mode support
  - Add colored output using chalk
  - Add loading spinners using ora
  - _Requirements: 5.5, 8.5_

- [ ] 7.1 Write property test for verbose logging
  - **Property 19: Verbose Logging Output**
  - **Validates: Requirements 5.5**

- [-] 8. Implement seed runner
  - Create `seed/runner.ts` with main execution logic
  - Implement single module execution
  - Implement batch module execution with dependency ordering
  - Implement dry-run mode
  - Implement clear mode (table truncation)
  - Generate and display seed summary
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.5, 5.3, 5.4_

- [ ] 8.1 Write property test for dry-run non-modification
  - **Property 6: Dry Run Non-Modification**
  - **Validates: Requirements 5.4**

- [ ] 8.2 Write property test for clear flag cleanup
  - **Property 7: Clear Flag Cleanup**
  - **Validates: Requirements 5.3**

- [ ] 8.3 Write property test for error isolation
  - **Property 8: Error Isolation**
  - **Validates: Requirements 2.5**

- [ ] 8.4 Write property test for summary completeness
  - **Property 20: Summary Information Completeness**
  - **Validates: Requirements 1.5**

- [x] 9. Implement main CLI entry point
  - Create `seed/index.ts` as the main entry point
  - Wire together CLI parser, registry, dependency resolver, and runner
  - Implement error handling and user feedback
  - Add confirmation prompts for destructive operations
  - _Requirements: All CLI-related requirements_

- [-] 10. Implement base web scraper
  - Create `web-scraper/base/http-client.ts` with HTTP utilities
  - Create `web-scraper/base/parser.ts` with HTML parsing utilities using cheerio
  - Create `web-scraper/base/scraper.ts` with BaseScraper abstract class
  - Implement retry logic with exponential backoff
  - Implement rate limiting with p-limit
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 10.1 Write property test for retry with exponential backoff
  - **Property 14: Retry with Exponential Backoff**
  - **Validates: Requirements 4.2**

- [ ] 11. Implement data transformer utilities
  - Create `web-scraper/transformers/base-transformer.ts` with DataTransformer interface
  - Implement validation utilities for transformed data
  - Add schema mapping helpers
  - _Requirements: 3.2, 4.4_

- [ ] 11.1 Write property test for data transformation
  - **Property 13: Scraper Data Transformation**
  - **Validates: Requirements 3.2, 4.4**

- [-] 12. Implement university seed module
  - Create `seed/modules/university.ts` with university seeding logic
  - Create `seed/data/universities.json` with manual university data
  - Implement duplicate detection by slug
  - Implement data validation for required fields
  - Add support for both manual and scraped data sources
  - _Requirements: 3.1, 3.3, 3.4_

- [ ] 12.1 Write property test for idempotent seeding
  - **Property 5: Idempotent Seeding**
  - **Validates: Requirements 3.3**

- [ ] 12.2 Write property test for data validation
  - **Property 11: Data Validation Before Insertion**
  - **Property 12: Unique Constraint Respect**
  - **Validates: Requirements 3.4, 7.2, 7.4**

- [ ] 13. Implement university web scraper
  - Create `web-scraper/scrapers/university-scraper.ts` extending BaseScraper
  - Create `web-scraper/transformers/university-transformer.ts` for data transformation
  - Implement pagination support for multi-page scraping
  - Add error handling and fallback to manual data
  - _Requirements: 3.2, 3.5, 4.3_

- [ ] 13.1 Write property test for pagination support
  - **Property 15: Pagination Support**
  - **Validates: Requirements 4.3**

- [ ] 14. Implement additional seed modules
  - Create `seed/modules/faculty.ts` with faculty seeding (depends on university)
  - Create `seed/modules/department.ts` with department seeding (depends on faculty)
  - Create `seed/modules/curriculum.ts` with curriculum seeding
  - Ensure proper dependency declarations
  - _Requirements: 2.3, 7.1_

- [ ] 14.1 Write property test for realistic data generation
  - **Property 17: Timestamp Field Realism**
  - **Property 18: Optional Field Distribution**
  - **Validates: Requirements 7.3, 7.5**

- [x] 15. Create documentation and templates
  - Create `seed/README.md` with setup instructions and usage examples
  - Create `seed/TEMPLATE.ts` with seed module template
  - Create `web-scraper/README.md` with scraping guidelines and examples
  - Document the SeedModule interface and expected exports
  - Add troubleshooting guide with common errors
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Write integration tests
  - Write end-to-end test for full seeding workflow
  - Write test for web scraper integration with mock HTTP responses
  - Write test for CLI integration with various flag combinations
  - Write test for error scenarios and rollback behavior

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
