# Progress Tracking in Seed Modules

## Overview

The seed system now includes a global progress tracking system that modules can use to report their progress in real-time.

## How It Works

When a seed module runs, the runner automatically injects a `ProgressTracker` into the `options` parameter. Modules can use this to report progress.

## Progress Tracker API

```typescript
interface ProgressTracker {
  setTotal(total: number): void          // Set total number of items
  increment(message?: string): void      // Increment by 1
  updateProgress(current: number, total: number, message?: string): void  // Update to specific value
  complete(): void                       // Mark as complete
}
```

## Usage Example

```typescript
export const mySeed: SeedModule = {
  name: 'my-module',
  dependencies: [],

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const data = await loadData()

    // Set total items
    if (options.progress) {
      options.progress.setTotal(data.length)
    }

    let inserted = 0
    for (const item of data) {
      await db.insert(myTable).values(item)
      inserted++

      // Report progress
      if (options.progress) {
        options.progress.increment(`Inserted: ${inserted}/${data.length}`)
      }
    }

    // Mark complete
    if (options.progress) {
      options.progress.complete()
    }

    return { /* ... */ }
  }
}
```

## Display Format

The progress tracker shows:
- Module name
- Progress bar (visual indicator)
- Current/Total count with percentage
- Elapsed time and ETA
- Custom status message

Example output:
```
🔄 cuhk-courses: [████████████████░░░░░░░░░░░░░░] 1234/2000 (61%) | ETA: 15s - Courses: 800/1000
```

## Benefits

- **Real-time feedback**: See exactly what's happening
- **Progress estimation**: Know how long it will take
- **Error visibility**: Quickly spot if something is stuck
- **Better UX**: No more wondering if the process is frozen

## Notes

- Progress updates are throttled to every 100ms to avoid performance issues
- The tracker automatically clears the line when complete
- If `options.progress` is undefined, the module works normally without progress tracking
