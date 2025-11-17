import { ORPCError } from '@orpc/server'
import {
  accounts as accountsTable,
  attachments as attachmentsTable,
  categories as categoriesTable,
  events as eventsTable,
  organization as organizationTable,
  transactionEntries as transactionEntriesTable,
  transactionSplits as transactionSplitsTable,
  transactions as transactionsTable
} from '@rov/db'
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

// Helper function to validate double-entry (sum of entries must equal 0)
function validateDoubleEntry(entries: Array<{ amount: string }>): boolean {
  const sum = entries.reduce((acc, entry) => {
    return acc + Number.parseFloat(entry.amount)
  }, 0)
  return Math.abs(sum) < 0.01 // Allow for floating point precision
}

type TransactionType =
  | 'personal_expense'
  | 'club_expense'
  | 'reimbursement'
  | 'borrow'
  | 'lend'
  | 'transfer'
  | 'event_payment'

type ReimbursementStatus = 'none' | 'pending' | 'approved' | 'paid'

// Helper function to create transaction with entries
async function createTransactionWithEntries(
  transactionData: {
    createdByUserId: string
    clubId?: string | null
    type: TransactionType
    description?: string | null
    notes?: string | null
    eventId?: string | null
    categoryId?: string | null
    totalAmount: string
    currency: string
    isSplit: boolean
    reimbursementStatus: ReimbursementStatus
    metadata?: Record<string, unknown> | null
  },
  entries: Array<{
    accountId: string
    amount: string
    memo?: string | null
  }>
) {
  // Validate double-entry
  if (!validateDoubleEntry(entries)) {
    throw new ORPCError('DOUBLE_ENTRY_MISMATCH', {
      message: 'Double-entry validation failed: debits must equal credits'
    })
  }

  // Create transaction
  const [transaction] = await db
    .insert(transactionsTable)
    .values(transactionData)
    .returning()

  if (!transaction) {
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'Failed to create transaction'
    })
  }

  // Create entries
  await db.insert(transactionEntriesTable).values(
    entries.map((entry) => ({
      transactionId: transaction.id,
      accountId: entry.accountId,
      amount: entry.amount,
      memo: entry.memo
    }))
  )

  // Fetch transaction with relations
  const fullTransaction = await db.query.transactions.findFirst({
    where: eq(transactionsTable.id, transaction.id),
    with: {
      entries: true,
      splits: true,
      attachments: true
    }
  })

  if (!fullTransaction) {
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'Failed to fetch created transaction'
    })
  }

  // Transform metadata to match contract
  return {
    ...fullTransaction,
    metadata:
      fullTransaction.metadata && typeof fullTransaction.metadata === 'object'
        ? (fullTransaction.metadata as Record<string, unknown>)
        : null
  }
}

export const expenses = {
  createExpense: protectedProcedure.expenses.createExpense.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Verify account exists and belongs to user/club
      const account = await db.query.accounts.findFirst({
        where: eq(accountsTable.id, input.accountId)
      })

      if (!account) {
        throw new ORPCError('INVALID_ACCOUNT', {
          message: 'Invalid account'
        })
      }

      // Check ownership
      if (account.ownerUserId && account.ownerUserId !== userId) {
        throw new ORPCError('INVALID_ACCOUNT', {
          message: 'Account does not belong to user'
        })
      }

      if (input.clubId && account.ownerClubId !== input.clubId) {
        throw new ORPCError('INVALID_ACCOUNT', {
          message: 'Account does not belong to club'
        })
      }

      const totalAmount = input.totalAmount.toFixed(2)
      const isSplit = Boolean(input.splits && input.splits.length > 0)

      // Prepare entries
      const entries: Array<{
        accountId: string
        amount: string
        memo?: string | null
      }> = []

      // Debit expense account (or the account that paid)
      entries.push({
        accountId: input.accountId,
        amount: totalAmount, // positive = debit
        memo: input.description || null
      })

      // Credit source account (cash, bank, etc.)
      // For now, we'll use the same account as a simple expense
      // In a full system, you'd have separate accounts for different sources
      entries.push({
        accountId: input.accountId,
        amount: `-${totalAmount}`, // negative = credit
        memo: input.description || null
      })

      const transaction = await createTransactionWithEntries(
        {
          createdByUserId: userId,
          clubId: input.clubId || null,
          type: input.clubId ? 'club_expense' : 'personal_expense',
          description: input.description || null,
          notes: input.notes || null,
          eventId: input.eventId || null,
          categoryId: input.categoryId || null,
          totalAmount,
          currency: input.currency,
          isSplit,
          reimbursementStatus: 'none',
          metadata: null
        },
        entries
      )

      // If split, create split records
      if (isSplit && input.splits) {
        const splitTotal = input.splits.reduce(
          (sum, split) => sum + split.shareAmount,
          0
        )

        if (Math.abs(splitTotal - input.totalAmount) > 0.01) {
          throw new ORPCError('INVALID_AMOUNT', {
            message: 'Split amounts must equal total amount'
          })
        }

        await db.insert(transactionSplitsTable).values(
          input.splits.map((split) => ({
            transactionId: transaction.id,
            userId: split.userId,
            accountId: split.accountId || null,
            shareAmount: split.shareAmount.toFixed(2),
            percentage: ((split.shareAmount / input.totalAmount) * 100).toFixed(
              2
            )
          }))
        )
      }

      // Fetch transaction with splits
      const fullTransaction = await db.query.transactions.findFirst({
        where: eq(transactionsTable.id, transaction.id),
        with: {
          entries: true,
          splits: true,
          attachments: true
        }
      })

      if (!fullTransaction) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to fetch created transaction'
        })
      }

      return {
        ...fullTransaction,
        metadata:
          fullTransaction.metadata &&
          typeof fullTransaction.metadata === 'object'
            ? (fullTransaction.metadata as Record<string, unknown>)
            : null
      }
    }
  ),

  requestReimbursement:
    protectedProcedure.expenses.requestReimbursement.handler(
      async ({ input, context }) => {
        const userId = context.session.user.id

        // Get original expense transaction
        const expenseTransaction = await db.query.transactions.findFirst({
          where: eq(transactionsTable.id, input.expenseTransactionId),
          with: {
            entries: true
          }
        })

        if (!expenseTransaction) {
          throw new ORPCError('TRANSACTION_NOT_FOUND', {
            message: 'Transaction not found'
          })
        }

        // Verify club membership
        if (expenseTransaction.clubId !== input.clubId) {
          throw new ORPCError('INVALID_CLUB', {
            message: 'Invalid club'
          })
        }

        // Get or create club liability account
        let clubAccount = await db.query.accounts.findFirst({
          where: and(
            eq(accountsTable.ownerClubId, input.clubId),
            eq(accountsTable.type, 'liability')
          )
        })

        if (!clubAccount) {
          const [newAccount] = await db
            .insert(accountsTable)
            .values({
              ownerClubId: input.clubId,
              name: 'Reimbursements Payable',
              type: 'liability',
              currency: expenseTransaction.currency
            })
            .returning()
          clubAccount = newAccount
        }

        // Get or create user receivable account
        let userAccount = await db.query.accounts.findFirst({
          where: and(
            eq(accountsTable.ownerUserId, userId),
            eq(accountsTable.type, 'asset')
          )
        })

        if (!userAccount) {
          const [newAccount] = await db
            .insert(accountsTable)
            .values({
              ownerUserId: userId,
              name: 'Reimbursements Receivable',
              type: 'asset',
              currency: expenseTransaction.currency
            })
            .returning()
          userAccount = newAccount
        }

        // Create reimbursement transaction
        const reimbursement = await createTransactionWithEntries(
          {
            createdByUserId: userId,
            clubId: input.clubId,
            type: 'reimbursement',
            description: `Reimbursement for: ${expenseTransaction.description}`,
            notes: null,
            eventId: expenseTransaction.eventId,
            categoryId: expenseTransaction.categoryId,
            totalAmount: expenseTransaction.totalAmount,
            currency: expenseTransaction.currency,
            isSplit: false,
            reimbursementStatus: 'pending',
            metadata: {
              originalTransactionId: input.expenseTransactionId
            }
          },
          [
            // Debit club account (liability - owes member)
            {
              accountId: clubAccount.id,
              amount: expenseTransaction.totalAmount,
              memo: 'Reimbursement owed'
            },
            // Credit member account (asset - member is owed)
            {
              accountId: userAccount.id,
              amount: `-${expenseTransaction.totalAmount}`,
              memo: 'Reimbursement receivable'
            }
          ]
        )

        return reimbursement
      }
    ),

  approveReimbursement:
    protectedProcedure.expenses.approveReimbursement.handler(
      async ({ input }) => {
        const transaction = await db.query.transactions.findFirst({
          where: eq(transactionsTable.id, input.reimbursementTransactionId)
        })

        if (!transaction) {
          throw new ORPCError('TRANSACTION_NOT_FOUND', {
            message: 'Transaction not found'
          })
        }

        // TODO: Check if user has permission to approve (club admin/treasurer)
        // For now, just update status
        await db
          .update(transactionsTable)
          .set({ reimbursementStatus: 'approved' })
          .where(eq(transactionsTable.id, input.reimbursementTransactionId))

        const updated = await db.query.transactions.findFirst({
          where: eq(transactionsTable.id, input.reimbursementTransactionId),
          with: {
            entries: true,
            splits: true,
            attachments: true
          }
        })

        if (!updated) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Failed to fetch updated transaction'
          })
        }

        return {
          ...updated,
          metadata:
            updated.metadata && typeof updated.metadata === 'object'
              ? (updated.metadata as Record<string, unknown>)
              : null
        }
      }
    ),

  payReimbursement: protectedProcedure.expenses.payReimbursement.handler(
    async ({ input, context }) => {
      const reimbursement = await db.query.transactions.findFirst({
        where: eq(transactionsTable.id, input.reimbursementTransactionId)
      })

      if (!reimbursement) {
        throw new ORPCError('TRANSACTION_NOT_FOUND', {
          message: 'Transaction not found'
        })
      }

      if (reimbursement.reimbursementStatus !== 'approved') {
        throw new ORPCError('INVALID_ACCOUNTS', {
          message: 'Reimbursement must be approved before payment'
        })
      }

      // Create payment transaction
      const payment = await createTransactionWithEntries(
        {
          createdByUserId: context.session.user.id,
          clubId: reimbursement.clubId,
          type: 'reimbursement',
          description: `Payment for reimbursement: ${reimbursement.description}`,
          notes: null,
          eventId: reimbursement.eventId,
          categoryId: reimbursement.categoryId,
          totalAmount: reimbursement.totalAmount,
          currency: reimbursement.currency,
          isSplit: false,
          reimbursementStatus: 'paid',
          metadata: {
            reimbursementTransactionId: input.reimbursementTransactionId
          }
        },
        [
          // Debit club account (pays out)
          {
            accountId: input.clubAccountId,
            amount: reimbursement.totalAmount,
            memo: 'Reimbursement payment'
          },
          // Credit member account (receives payment)
          {
            accountId: input.memberAccountId,
            amount: `-${reimbursement.totalAmount}`,
            memo: 'Reimbursement received'
          }
        ]
      )

      // Update original reimbursement status
      await db
        .update(transactionsTable)
        .set({ reimbursementStatus: 'paid' })
        .where(eq(transactionsTable.id, input.reimbursementTransactionId))

      return payment
    }
  ),

  createPeerLoan: protectedProcedure.expenses.createPeerLoan.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Verify accounts
      const lenderAccount = await db.query.accounts.findFirst({
        where: eq(accountsTable.id, input.lenderAccountId)
      })
      const borrowerAccount = await db.query.accounts.findFirst({
        where: eq(accountsTable.id, input.borrowerAccountId)
      })

      if (!(lenderAccount && borrowerAccount)) {
        throw new ORPCError('INVALID_ACCOUNTS', {
          message: 'Invalid accounts'
        })
      }

      const amount = input.amount.toFixed(2)

      const loan = await createTransactionWithEntries(
        {
          createdByUserId: userId,
          clubId: null,
          type: input.lenderAccountId === userId ? 'lend' : 'borrow',
          description: input.description || null,
          notes: null,
          eventId: null,
          categoryId: null,
          totalAmount: amount,
          currency: input.currency,
          isSplit: false,
          reimbursementStatus: 'none',
          metadata: {
            lenderAccountId: input.lenderAccountId,
            borrowerAccountId: input.borrowerAccountId
          }
        },
        [
          // Debit borrower account (receives loan)
          {
            accountId: input.borrowerAccountId,
            amount,
            memo: 'Loan received'
          },
          // Credit lender account (gives loan)
          {
            accountId: input.lenderAccountId,
            amount: `-${amount}`,
            memo: 'Loan given'
          }
        ]
      )

      return loan
    }
  ),

  transferBetweenAccounts:
    protectedProcedure.expenses.transferBetweenAccounts.handler(
      async ({ input, context }) => {
        const userId = context.session.user.id

        // Verify accounts
        const fromAccount = await db.query.accounts.findFirst({
          where: eq(accountsTable.id, input.fromAccountId)
        })
        const toAccount = await db.query.accounts.findFirst({
          where: eq(accountsTable.id, input.toAccountId)
        })

        if (!(fromAccount && toAccount)) {
          throw new ORPCError('INVALID_ACCOUNTS', {
            message: 'Invalid accounts'
          })
        }

        // Check ownership
        if (
          fromAccount.ownerUserId &&
          fromAccount.ownerUserId !== userId &&
          fromAccount.ownerClubId
        ) {
          throw new ORPCError('INVALID_ACCOUNTS', {
            message: 'Account does not belong to user'
          })
        }

        const amount = input.amount.toFixed(2)

        const transfer = await createTransactionWithEntries(
          {
            createdByUserId: userId,
            clubId: fromAccount.ownerClubId || toAccount.ownerClubId || null,
            type: 'transfer',
            description: input.description || null,
            notes: null,
            eventId: null,
            categoryId: null,
            totalAmount: amount,
            currency: input.currency,
            isSplit: false,
            reimbursementStatus: 'none',
            metadata: null
          },
          [
            // Debit destination account
            {
              accountId: input.toAccountId,
              amount,
              memo: input.description || 'Transfer in'
            },
            // Credit source account
            {
              accountId: input.fromAccountId,
              amount: `-${amount}`,
              memo: input.description || 'Transfer out'
            }
          ]
        )

        return transfer
      }
    ),

  getNetBalance: protectedProcedure.expenses.getNetBalance.handler(
    async ({ context }) => {
      const userId = context.session.user.id

      // Get all user accounts
      const userAccounts = await db.query.accounts.findMany({
        where: eq(accountsTable.ownerUserId, userId)
      })

      // Calculate balances for each account
      const accountBalances = await Promise.all(
        userAccounts.map(async (account) => {
          const [balanceResult] = await db
            .select({
              balance: sql<string>`COALESCE(SUM(${transactionEntriesTable.amount})::text, '0')`
            })
            .from(transactionEntriesTable)
            .where(eq(transactionEntriesTable.accountId, account.id))

          return {
            accountId: account.id,
            accountName: account.name,
            balance: balanceResult?.balance || '0',
            currency: account.currency
          }
        })
      )

      // Calculate total balance
      const totalBalance = accountBalances.reduce(
        (sum, acc) => sum + Number.parseFloat(acc.balance),
        0
      )

      // Get pending reimbursements
      const pendingReimbursements = await db
        .select({
          total: sql<string>`COALESCE(SUM(${transactionsTable.totalAmount})::text, '0')`
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.reimbursementStatus, 'pending'),
            or(
              eq(transactionsTable.createdByUserId, userId),
              sql`${transactionsTable.id} IN (
                SELECT transaction_id FROM transaction_splits WHERE user_id = ${userId}
              )`
            )
          )
        )

      // Get peer debts (borrowed)
      const peerDebts = await db
        .select({
          total: sql<string>`COALESCE(SUM(${transactionsTable.totalAmount})::text, '0')`
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.type, 'borrow'),
            sql`${transactionsTable.id} IN (
              SELECT transaction_id FROM transaction_entries
              WHERE account_id IN (
                SELECT id FROM accounts WHERE owner_user_id = ${userId}
              ) AND amount > 0
            )`
          )
        )

      // Get peer loans (lent)
      const peerLoans = await db
        .select({
          total: sql<string>`COALESCE(SUM(${transactionsTable.totalAmount})::text, '0')`
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.type, 'lend'),
            sql`${transactionsTable.id} IN (
              SELECT transaction_id FROM transaction_entries
              WHERE account_id IN (
                SELECT id FROM accounts WHERE owner_user_id = ${userId}
              ) AND amount < 0
            )`
          )
        )

      return {
        totalBalance: totalBalance.toFixed(2),
        currency: userAccounts[0]?.currency || 'HKD',
        accountBalances,
        pendingReimbursements: pendingReimbursements[0]?.total || '0',
        peerDebts: peerDebts[0]?.total || '0',
        peerLoans: peerLoans[0]?.total || '0'
      }
    }
  ),

  getClubLedger: protectedProcedure.expenses.getClubLedger.handler(
    async ({ input }) => {
      const { clubId, query } = input

      const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof sql>> =
        [eq(transactionsTable.clubId, clubId)]

      if (query?.startDate) {
        conditions.push(
          sql`${transactionsTable.createdAt} >= ${query.startDate}`
        )
      }
      if (query?.endDate) {
        conditions.push(sql`${transactionsTable.createdAt} <= ${query.endDate}`)
      }
      if (query?.categoryId) {
        conditions.push(eq(transactionsTable.categoryId, query.categoryId))
      }
      if (query?.eventId) {
        conditions.push(eq(transactionsTable.eventId, query.eventId))
      }

      const page = 1
      const limit = 20
      const offset = (page - 1) * limit

      // Get summary
      const [summary] = await db
        .select({
          totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'event_payment' THEN ${transactionsTable.totalAmount} ELSE 0 END)::text, '0')`,
          totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} IN ('club_expense', 'reimbursement') THEN ${transactionsTable.totalAmount} ELSE 0 END)::text, '0')`
        })
        .from(transactionsTable)
        .where(and(...conditions))

      // Get currency from first transaction, or default to HKD
      const [firstTransaction] = await db
        .select({
          currency: transactionsTable.currency
        })
        .from(transactionsTable)
        .where(and(...conditions))
        .limit(1)

      // Get transactions
      const transactions = await db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: desc(transactionsTable.createdAt),
        limit,
        offset,
        with: {
          entries: true,
          splits: true,
          attachments: true
        }
      })

      // Get count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactionsTable)
        .where(and(...conditions))

      const total = Number(countResult?.count ?? 0)

      const totalIncome = Number.parseFloat(summary?.totalIncome || '0')
      const totalExpenses = Number.parseFloat(summary?.totalExpenses || '0')
      const currency = firstTransaction?.currency || 'HKD'

      return {
        summary: {
          totalIncome: totalIncome.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          netBalance: (totalIncome - totalExpenses).toFixed(2),
          currency
        },
        transactions: transactions.map((t) => ({
          ...t,
          metadata:
            t.metadata && typeof t.metadata === 'object'
              ? (t.metadata as Record<string, unknown>)
              : null
        })),
        meta: {
          page,
          limit,
          total,
          totalPage: Math.ceil(total / limit)
        }
      }
    }
  ),

  uploadReceipt: protectedProcedure.expenses.uploadReceipt.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Verify transaction exists
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactionsTable.id, input.transactionId)
      })

      if (!transaction) {
        throw new ORPCError('TRANSACTION_NOT_FOUND', {
          message: 'Transaction not found'
        })
      }

      const [attachment] = await db
        .insert(attachmentsTable)
        .values({
          transactionId: input.transactionId,
          fileUrl: input.fileUrl,
          uploadedBy: userId
        })
        .returning()

      return attachment
    }
  ),

  listTransactions: protectedProcedure.expenses.listTransactions.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { query } = input

      const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof sql>> =
        []

      if (query?.clubId) {
        conditions.push(eq(transactionsTable.clubId, query.clubId))
      } else if (query?.userId) {
        conditions.push(eq(transactionsTable.createdByUserId, query.userId))
      } else {
        // Default to current user
        conditions.push(eq(transactionsTable.createdByUserId, userId))
      }

      if (query?.type) {
        conditions.push(eq(transactionsTable.type, query.type))
      }
      if (query?.categoryId) {
        conditions.push(eq(transactionsTable.categoryId, query.categoryId))
      }
      if (query?.eventId) {
        conditions.push(eq(transactionsTable.eventId, query.eventId))
      }
      if (query?.startDate) {
        conditions.push(
          sql`${transactionsTable.createdAt} >= ${query.startDate}`
        )
      }
      if (query?.endDate) {
        conditions.push(sql`${transactionsTable.createdAt} <= ${query.endDate}`)
      }

      const page = query?.page || 1
      const limit = query?.limit || 20
      const offset = (page - 1) * limit

      const transactions = await db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: desc(transactionsTable.createdAt),
        limit,
        offset,
        with: {
          entries: true,
          splits: true,
          attachments: true
        }
      })

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactionsTable)
        .where(and(...conditions))

      const total = Number(countResult?.count ?? 0)

      return {
        data: transactions.map((t) => ({
          ...t,
          metadata:
            t.metadata && typeof t.metadata === 'object'
              ? (t.metadata as Record<string, unknown>)
              : null
        })),
        meta: {
          page,
          limit,
          total,
          totalPage: Math.ceil(total / limit)
        }
      }
    }
  ),

  listAccounts: protectedProcedure.expenses.listAccounts.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { query } = input

      const conditions: Array<
        ReturnType<typeof eq> | ReturnType<typeof isNull>
      > = []

      if (query?.userId) {
        conditions.push(eq(accountsTable.ownerUserId, query.userId))
      } else if (query?.clubId) {
        conditions.push(eq(accountsTable.ownerClubId, query.clubId))
      } else {
        // Default to current user
        conditions.push(eq(accountsTable.ownerUserId, userId))
      }

      const accounts = await db.query.accounts.findMany({
        where: and(...conditions, isNull(accountsTable.archivedAt))
      })

      return {
        data: accounts
      }
    }
  ),

  createAccount: protectedProcedure.expenses.createAccount.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      if (!(input.ownerUserId || input.ownerClubId)) {
        throw new ORPCError('INVALID_OWNER', {
          message: 'Must specify either ownerUserId or ownerClubId'
        })
      }

      // If ownerUserId is not specified, use current user
      const ownerUserId = input.ownerUserId || userId

      const [account] = await db
        .insert(accountsTable)
        .values({
          ownerUserId: input.ownerClubId ? null : ownerUserId,
          ownerClubId: input.ownerClubId || null,
          name: input.name,
          type: input.type,
          currency: input.currency
        })
        .returning()

      return account
    }
  ),

  listCategories: protectedProcedure.expenses.listCategories.handler(
    async ({ input }) => {
      const { query } = input
      const conditions: ReturnType<typeof eq>[] = []

      if (query?.clubId) {
        conditions.push(eq(categoriesTable.clubId, query.clubId))
      }

      const categories = await db.query.categories.findMany({
        where: and(...conditions)
      })

      return {
        data: categories
      }
    }
  ),

  createCategory: protectedProcedure.expenses.createCategory.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      const [category] = await db
        .insert(categoriesTable)
        .values({
          clubId: input.clubId || null,
          createdByUserId: userId,
          name: input.name,
          icon: input.icon || null
        })
        .returning()

      return category
    }
  ),

  createEvent: protectedProcedure.expenses.createEvent.handler(
    async ({ input }) => {
      // Verify club exists
      const club = await db.query.organization.findFirst({
        where: eq(organizationTable.id, input.clubId)
      })

      if (!club) {
        throw new ORPCError('INVALID_CLUB', {
          message: 'Invalid club'
        })
      }

      const [event] = await db
        .insert(eventsTable)
        .values({
          clubId: input.clubId,
          name: input.name,
          description: input.description || null,
          startDate: input.startDate || null,
          endDate: input.endDate || null
        })
        .returning()

      if (!event) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create event'
        })
      }

      return event
    }
  ),

  listEvents: protectedProcedure.expenses.listEvents.handler(
    async ({ input }) => {
      const { query } = input

      if (!query?.clubId) {
        return { data: [] }
      }

      const events = await db.query.events.findMany({
        where: eq(eventsTable.clubId, query.clubId),
        orderBy: desc(eventsTable.startDate)
      })

      return {
        data: events
      }
    }
  )
}
