import { oc } from '@orpc/contract'
import { z } from 'zod'

// Common schemas
const accountSchema = z.object({
  id: z.string(),
  ownerUserId: z.string().nullable(),
  ownerClubId: z.string().nullable(),
  name: z.string(),
  type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
  currency: z.string(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

const categorySchema = z.object({
  id: z.string(),
  clubId: z.string().nullable(),
  createdByUserId: z.string().nullable(),
  name: z.string(),
  icon: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

const eventSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

const transactionEntrySchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  accountId: z.string(),
  amount: z.string(), // numeric as string
  memo: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

const transactionSplitSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  userId: z.string(),
  accountId: z.string().nullable(),
  shareAmount: z.string(), // numeric as string
  percentage: z.string().nullable(), // numeric as string
  createdAt: z.string(),
  updatedAt: z.string()
})

const attachmentSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  fileUrl: z.string(),
  uploadedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

const transactionSchema = z.object({
  id: z.string(),
  createdByUserId: z.string(),
  clubId: z.string().nullable(),
  type: z.enum([
    'personal_expense',
    'club_expense',
    'reimbursement',
    'borrow',
    'lend',
    'transfer',
    'event_payment'
  ]),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  eventId: z.string().nullable(),
  categoryId: z.string().nullable(),
  totalAmount: z.string(), // numeric as string
  currency: z.string(),
  isSplit: z.boolean(),
  reimbursementStatus: z.enum(['none', 'pending', 'approved', 'paid']),
  metadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  entries: z.array(transactionEntrySchema).optional(),
  splits: z.array(transactionSplitSchema).optional(),
  attachments: z.array(attachmentSchema).optional()
})

export const expenses = {
  createExpense: oc
    .route({
      method: 'POST',
      description: 'Create a personal or club expense with optional splits',
      summary: 'Create Expense',
      tags: ['Expenses']
    })
    .input(
      z.object({
        description: z.string().optional(),
        totalAmount: z.number().positive(),
        currency: z.string().default('HKD'),
        accountId: z.string(),
        clubId: z.string().optional(),
        categoryId: z.string().optional(),
        eventId: z.string().optional(),
        notes: z.string().optional(),
        splits: z
          .array(
            z.object({
              userId: z.string(),
              shareAmount: z.number().positive(),
              accountId: z.string().optional()
            })
          )
          .optional()
      })
    )
    .output(transactionSchema)
    .errors({
      INVALID_ACCOUNT: {
        data: z.object({
          message: z.string().default('Invalid account')
        })
      },
      INVALID_AMOUNT: {
        data: z.object({
          message: z.string().default('Invalid amount')
        })
      },
      DOUBLE_ENTRY_MISMATCH: {
        data: z.object({
          message: z.string().default('Double-entry validation failed')
        })
      }
    }),

  requestReimbursement: oc
    .route({
      method: 'POST',
      description: 'Request reimbursement for an expense',
      summary: 'Request Reimbursement',
      tags: ['Expenses']
    })
    .input(
      z.object({
        expenseTransactionId: z.string(),
        clubId: z.string()
      })
    )
    .output(transactionSchema)
    .errors({
      TRANSACTION_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Transaction not found')
        })
      },
      INVALID_CLUB: {
        data: z.object({
          message: z.string().default('Invalid club')
        })
      }
    }),

  approveReimbursement: oc
    .route({
      method: 'POST',
      description: 'Approve a reimbursement request',
      summary: 'Approve Reimbursement',
      tags: ['Expenses']
    })
    .input(
      z.object({
        reimbursementTransactionId: z.string()
      })
    )
    .output(transactionSchema)
    .errors({
      TRANSACTION_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Transaction not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to approve reimbursement')
        })
      }
    }),

  payReimbursement: oc
    .route({
      method: 'POST',
      description: 'Execute reimbursement payment',
      summary: 'Pay Reimbursement',
      tags: ['Expenses']
    })
    .input(
      z.object({
        reimbursementTransactionId: z.string(),
        clubAccountId: z.string(),
        memberAccountId: z.string()
      })
    )
    .output(transactionSchema)
    .errors({
      TRANSACTION_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Transaction not found')
        })
      },
      INVALID_ACCOUNTS: {
        data: z.object({
          message: z.string().default('Invalid accounts')
        })
      }
    }),

  createPeerLoan: oc
    .route({
      method: 'POST',
      description: 'Create a peer-to-peer loan (lending/borrowing)',
      summary: 'Create Peer Loan',
      tags: ['Expenses']
    })
    .input(
      z.object({
        lenderAccountId: z.string(),
        borrowerAccountId: z.string(),
        amount: z.number().positive(),
        description: z.string().optional(),
        currency: z.string().default('HKD')
      })
    )
    .output(transactionSchema)
    .errors({
      INVALID_ACCOUNTS: {
        data: z.object({
          message: z.string().default('Invalid accounts')
        })
      }
    }),

  transferBetweenAccounts: oc
    .route({
      method: 'POST',
      description: 'Transfer money between accounts',
      summary: 'Transfer Between Accounts',
      tags: ['Expenses']
    })
    .input(
      z.object({
        fromAccountId: z.string(),
        toAccountId: z.string(),
        amount: z.number().positive(),
        description: z.string().optional(),
        currency: z.string().default('HKD')
      })
    )
    .output(transactionSchema)
    .errors({
      INVALID_ACCOUNTS: {
        data: z.object({
          message: z.string().default('Invalid accounts')
        })
      },
      INSUFFICIENT_BALANCE: {
        data: z.object({
          message: z.string().default('Insufficient balance')
        })
      }
    }),

  getNetBalance: oc
    .route({
      method: 'GET',
      description: "Get user's combined net balance across all accounts",
      summary: 'Get Net Balance',
      tags: ['Expenses']
    })
    .input(z.object({}).optional())
    .output(
      z.object({
        totalBalance: z.string(),
        currency: z.string(),
        accountBalances: z.array(
          z.object({
            accountId: z.string(),
            accountName: z.string(),
            balance: z.string(),
            currency: z.string()
          })
        ),
        pendingReimbursements: z.string(),
        peerDebts: z.string(),
        peerLoans: z.string()
      })
    ),

  getClubLedger: oc
    .route({
      method: 'GET',
      description: 'Get club financial report and ledger',
      summary: 'Get Club Ledger',
      tags: ['Expenses']
    })
    .input(
      z.object({
        clubId: z.string(),
        query: z
          .object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            categoryId: z.string().optional(),
            eventId: z.string().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        summary: z.object({
          totalIncome: z.string(),
          totalExpenses: z.string(),
          netBalance: z.string(),
          currency: z.string()
        }),
        transactions: z.array(transactionSchema),
        meta: z
          .object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPage: z.number()
          })
          .optional()
      })
    ),

  uploadReceipt: oc
    .route({
      method: 'POST',
      description: 'Upload receipt attachment for a transaction',
      summary: 'Upload Receipt',
      tags: ['Expenses']
    })
    .input(
      z.object({
        transactionId: z.string(),
        fileUrl: z.string()
      })
    )
    .output(attachmentSchema)
    .errors({
      TRANSACTION_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Transaction not found')
        })
      }
    }),

  listTransactions: oc
    .route({
      method: 'GET',
      description: 'Get transaction history with filters',
      summary: 'List Transactions',
      tags: ['Expenses']
    })
    .input(
      z.object({
        query: z
          .object({
            clubId: z.string().optional(),
            userId: z.string().optional(),
            type: z
              .enum([
                'personal_expense',
                'club_expense',
                'reimbursement',
                'borrow',
                'lend',
                'transfer',
                'event_payment'
              ])
              .optional(),
            categoryId: z.string().optional(),
            eventId: z.string().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            page: z.number().optional(),
            limit: z.number().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        data: z.array(transactionSchema),
        meta: z
          .object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPage: z.number()
          })
          .optional()
      })
    ),

  listAccounts: oc
    .route({
      method: 'GET',
      description: 'Get user or club accounts',
      summary: 'List Accounts',
      tags: ['Expenses']
    })
    .input(
      z.object({
        query: z
          .object({
            userId: z.string().optional(),
            clubId: z.string().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        data: z.array(accountSchema)
      })
    ),

  createAccount: oc
    .route({
      method: 'POST',
      description: 'Create a new account',
      summary: 'Create Account',
      tags: ['Expenses']
    })
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
        currency: z.string().default('HKD'),
        ownerUserId: z.string().optional(),
        ownerClubId: z.string().optional()
      })
    )
    .output(accountSchema)
    .errors({
      INVALID_OWNER: {
        data: z.object({
          message: z
            .string()
            .default('Must specify either ownerUserId or ownerClubId')
        })
      }
    }),

  listCategories: oc
    .route({
      method: 'GET',
      description: 'Get expense categories',
      summary: 'List Categories',
      tags: ['Expenses']
    })
    .input(
      z.object({
        query: z
          .object({
            clubId: z.string().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        data: z.array(categorySchema)
      })
    ),

  createCategory: oc
    .route({
      method: 'POST',
      description: 'Create a new expense category',
      summary: 'Create Category',
      tags: ['Expenses']
    })
    .input(
      z.object({
        name: z.string().min(1),
        icon: z.string().optional(),
        clubId: z.string().optional()
      })
    )
    .output(categorySchema),

  createEvent: oc
    .route({
      method: 'POST',
      description: 'Create a club event/project',
      summary: 'Create Event',
      tags: ['Expenses']
    })
    .input(
      z.object({
        clubId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      })
    )
    .output(eventSchema)
    .errors({
      INVALID_CLUB: {
        data: z.object({
          message: z.string().default('Invalid club')
        })
      }
    }),

  listEvents: oc
    .route({
      method: 'GET',
      description: 'Get club events',
      summary: 'List Events',
      tags: ['Expenses']
    })
    .input(
      z.object({
        query: z
          .object({
            clubId: z.string()
          })
          .optional()
      })
    )
    .output(
      z.object({
        data: z.array(eventSchema)
      })
    )
}
