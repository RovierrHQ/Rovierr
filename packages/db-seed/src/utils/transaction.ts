import type { DB } from '@rov/db'

export class TransactionManager {
  private db: DB
  private inTransaction = false

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Execute a function within a transaction
   * Note: Neon HTTP driver doesn't support transactions, so this just executes the function
   */
  async withTransaction<T>(fn: (db: DB) => Promise<T>): Promise<T> {
    this.inTransaction = true

    try {
      // Neon HTTP driver doesn't support transactions
      // Execute without transaction wrapper
      const result = await fn(this.db)

      this.inTransaction = false
      return result
    } catch (error) {
      this.inTransaction = false
      throw error
    }
  }

  /**
   * Execute a function without transaction wrapping
   */
  async withoutTransaction<T>(fn: (db: DB) => Promise<T>): Promise<T> {
    return await fn(this.db)
  }

  /**
   * Check if currently in a transaction
   */
  isInTransaction(): boolean {
    return this.inTransaction
  }
}

/**
 * Helper function to execute with or without transaction based on options
 */
export async function executeWithTransactionControl<T>(
  db: DB,
  useTransaction: boolean,
  fn: (d: DB) => Promise<T>
): Promise<T> {
  const manager = new TransactionManager(db)

  if (useTransaction) {
    return await manager.withTransaction(fn)
  }
  return await manager.withoutTransaction(fn)
}
