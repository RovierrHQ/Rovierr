# @rov/db-seed

A CLI-driven, modular database seeding system for the Rovierr platform.

## Installation

This package is part of the Rovierr monorepo and depends on `@rov/db`.

```bash
# From the monorepo root
bun install
```

## Quick Start

```bash
# From packages/db-seed directory
bun run seed

# Or from monorepo root
bun --filter @rov/db-seed seed

# Seed specific tables
bun run seed --only institution

# Seed with verbose logging
bun run seed:dev

# Clear and reseed
bun run seed --clear --only institution

# Dry run (processes data but doesn't insert to database)
bun run seed --dry-run --verbose
```

## Environment Variables

Set `DATABASE_URL` in your `.env` file:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## CLI Options

| Flag | Description | Example |
|------|-------------|---------|
| `--only <tables...>` | Seed only specified tables | `--only institution faculty` |
| `--exclude <tables...>` | Exclude specified tables | `--exclude expenses` |
| `--clear` | Truncate tables before seeding | `--clear` |
| `--dry-run` | Process data and show counts without inserting to database | `--dry-run` |
| `--verbose` | Detailed logging | `--verbose` |
| `--no-transaction` | Disable transaction wrapping | `--no-transaction` |
| `--force` | Skip confirmation prompts | `--force` |
| `--use-scraper` | Use web scraper if available | `--use-scraper` |
| `--skip-deps` | Skip dependency validation and ordering | `--skip-deps --only course-offering` |

### Skipping Dependencies

Use `--skip-deps` when you want to seed specific modules without their dependencies. This is useful when:

- You've already seeded large dependency tables (e.g., 6000+ courses)
- You're testing or mocking data for specific modules
- You want to re-run a single module without re-seeding everything

**Example:**

```bash
# Seed course offerings without re-seeding courses and institutional terms
bun run seed --only course-offering --skip-deps

# Seed multiple modules in exact order specified, bypassing dependency checks
bun run seed --only institutional-term course-offering --skip-deps
```

**⚠️ Warning:** Using `--skip-deps` assumes all required data already exists in the database. If dependencies are missing, the seed will fail with foreign key constraint errors.

## Project Structure

```
seed/
├── index.ts              # Main CLI entry point
├── runner.ts             # Seed execution engine
├── registry.ts           # Module discovery and registration
├── types.ts              # Type definitions
├── errors.ts             # Error classes
├── utils/
│   ├── cli.ts           # CLI argument parsing
│   ├── logger.ts        # Logging utilities
│   ├── transaction.ts   # Transaction management
│   └── dependency.ts    # Dependency resolution
├── modules/
│   ├── institution.ts   # Institution seed module
│   └── ...              # Other seed modules
└── data/
    ├── universities.csv # Manual data dumps
    └── ...
```

## Creating a Seed Module

### Module Structure

Each seed module should have:
1. **prepareData()** - Optional method that loads and processes data (returns data, no DB operations)
2. **seed()** - Required method that calls prepareData() and performs DB operations
3. **clear()** - Optional method to clear the table

**Key principle:** `seed()` should call `prepareData()` to avoid duplicating data loading logic.

### Basic Template

Create a new file in `modules/` directory:

```typescript
import type { DB } from '@rov/db'
import type { SeedModule, SeedOptions, SeedResult, PrepareDataResult } from '../types'
import { yourTable } from '@rov/db/schema'
import { DEFAULT_BATCH_SIZE, chunk } from '../utils/batch'

interface YourRecord {
  id: string
  name: string
  // ... other fields
}

export const yourSeed: SeedModule<{ records: YourRecord[] }> = {
  name: 'your-table-name',
  dependencies: [], // List parent tables if any

  // Required: For dry-run support - loads and processes data
  async prepareData(db: DB, options: SeedOptions) {
    // Load your data from CSV, API, etc.
    const data = await loadYourData()

    // Validate and filter records
    const validRecords = data.filter(validateRecord)

    return {
      data: { records: validRecords }, // Named entity with array
      invalidCount: data.length - validRecords.length
    }
  },

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()

    // Get prepared data (reuses prepareData logic)
    const { data, invalidCount = 0 } = await yourSeed.prepareData(db, options)
    const validRecords = data.records

    let inserted = 0
    let skipped = 0
    const errors: SeedResult['errors'] = []

    if (options.progress) {
      options.progress.setTotal(validRecords.length)
    }

    // Insert records in batches (efficient for large datasets)
    const batches = chunk(validRecords, DEFAULT_BATCH_SIZE)

    for (const batch of batches) {
      try {
        await db.insert(yourTable).values(batch)
        inserted += batch.length
        if (options.progress) {
          options.progress.increment(`${inserted}/${validRecords.length}`)
        }
      } catch (err) {
        // If batch fails, try individual inserts
        for (const record of batch) {
          try {
            await db.insert(yourTable).values(record)
            inserted++
          } catch (individualErr) {
            skipped++
            errors.push({
              record,
              error: individualErr as Error,
              phase: 'execution'
            })
          }
        }
      }
    }

    return {
      tableName: 'your-table-name',
      recordsInserted: inserted,
      recordsSkipped: skipped,
      errors,
      duration: Date.now() - startTime,
    }
  },

  async clear(db: NeonDatabase<any>): Promise<void> {
    await db.delete(yourTable)
  },
}

export default yourSeed
```

### With Dependencies

If your table has foreign keys:

```typescript
export const facultySeed: SeedModule = {
  name: 'faculty',
  dependencies: ['institution'], // Will seed institution first

  async seed(db, options) {
    // Your seeding logic
  }
}
```

### With CSV Data

```typescript
import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'

function loadFromCSV() {
  const csvPath = join(__dirname, '../data/your-data.csv')
  const csvContent = readFileSync(csvPath, 'utf-8')

  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
}
```

### With Web Scraper

```typescript
import { YourScraper } from '../../web-scraper/scrapers/your-scraper'

async function loadFromScraper() {
  const scraper = new YourScraper()
  return await scraper.scrape()
}

export const yourSeed: SeedModule = {
  name: 'your-table',

  async seed(db, options) {
    let data = loadFromCSV()

    if (options.useScraper) {
      const scrapedData = await loadFromScraper()
      data = [...data, ...scrapedData]
    }

    // Continue with seeding...
  }
}
```

## Data Sources

### CSV Files

Place CSV files in `data/` directory:

```csv
name,slug,type,country,city
"Institution Name",slug,university,"Country","City"
```

### Web Scrapers

See `web-scraper/README.md` for scraper implementation guide.

## Validation

Always validate records before insertion:

```typescript
function validateRecord(record: YourRecord): boolean {
  return !!(
    record.requiredField1 &&
    record.requiredField2 &&
    record.arrayField?.length > 0
  )
}

const validRecords = data.filter(validateRecord)
```

## Error Handling

The seeding system handles errors gracefully:

- **Validation errors**: Invalid records are skipped and logged
- **Database errors**: Caught and reported, other seeds continue
- **Transaction mode**: All changes rolled back on error
- **No-transaction mode**: Errors logged, execution continues

## Troubleshooting

### Module not found

```
Error: Module "xyz" not found in dependency graph
```

**Solution**: Check that the module file exists in `modules/` and exports a valid SeedModule.

### Missing dependencies

```
Error: Missing dependencies detected: faculty -> institution
```

**Solution**: Ensure parent tables are seeded first or add to dependencies array.

### Circular dependencies

```
Error: Circular dependency detected: A -> B -> C -> A
```

**Solution**: Review and fix circular references in dependencies.

### Database connection error

```
Error: DATABASE_URL environment variable is not set
```

**Solution**: Set DATABASE_URL in your `.env` file.

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db

# Optional
SEED_VERBOSE=true
SEED_DRY_RUN=false
```

## Best Practices

1. **Use transactions** for related tables (default behavior)
2. **Validate data** before insertion
3. **Handle duplicates** with `onConflictDoUpdate` or `onConflictDoNothing`
4. **Log errors** but don't fail the entire seed
5. **Use CSV for static data**, scrapers for dynamic data
6. **Test with --dry-run** before actual seeding
7. **Use --verbose** for debugging

## Examples

### Seed everything

```bash
bun run seed
```

### Seed specific tables with dependencies

```bash
# This will also seed 'institution' because 'faculty' depends on it
bun run seed --only faculty
```

### Clear and reseed with scraper

```bash
bun run seed --clear --use-scraper --only institution
```

### Test without changes

```bash
bun run seed --dry-run --verbose
```

### Seed without transactions (faster, but risky)

```bash
bun run seed --no-transaction
```
