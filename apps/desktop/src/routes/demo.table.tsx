import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { compareItems, rankItem } from '@tanstack/match-sorter-utils'
import { createFileRoute } from '@tanstack/react-router'
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingFn
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable
} from '@tanstack/react-table'
import React from 'react'
import type { Person } from '../data/demo-table-data'
import { makeData } from '../data/demo-table-data'

export const Route = createFileRoute('/demo/table')({
  component: TableDemo
})

declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<Person> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Define a custom fuzzy sort function that will sort by rank if the row has ranking information
const fuzzySort: SortingFn<Person> = (rowA, rowB, columnId) => {
  let dir = 0

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank,
      rowB.columnFiltersMeta[columnId]?.itemRank
    )
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}

function TableDemo() {
  const rerender = React.useReducer(() => ({}), {})[1]

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo<ColumnDef<Person, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        filterFn: 'equalsString' //note: normal non-fuzzy filter column - exact match required
      },
      {
        accessorKey: 'firstName',
        cell: (info) => info.getValue(),
        filterFn: 'includesStringSensitive' //note: normal non-fuzzy filter column - case sensitive
      },
      {
        accessorFn: (row) => row.lastName,
        id: 'lastName',
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        filterFn: 'includesString' //note: normal non-fuzzy filter column - case insensitive
      },
      {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: 'fullName',
        header: 'Full Name',
        cell: (info) => info.getValue(),
        filterFn: 'fuzzy', //using our custom fuzzy filter function
        // filterFn: fuzzyFilter, //or just define with the function
        sortingFn: fuzzySort //sort by fuzzy rank (falls back to alphanumeric)
      }
    ],
    []
  )

  const [data, setData] = React.useState<Person[]>(() => makeData(5000))
  const refreshData = () => setData((_old) => makeData(50_000)) //stress test

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter //define as a filter function that can be used in column definitions
    },
    state: {
      columnFilters,
      globalFilter
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy', //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false
  })

  //apply the fuzzy sort if the fullName column is being filtered
  React.useEffect(() => {
    if (
      table.getState().columnFilters[0]?.id === 'fullName' &&
      table.getState().sorting[0]?.id !== 'fullName'
    ) {
      table.setSorting([{ id: 'fullName', desc: false }])
    }
  }, [table])

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div>
        <DebouncedInput
          className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
        />
      </div>
      <div className="h-4" />
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-gray-200 text-sm">
          <thead className="bg-gray-800 text-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      className="px-4 py-3 text-left"
                      colSpan={header.colSpan}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none hover:text-blue-400 transition-colors'
                                : '',
                              onClick: header.column.getToggleSortingHandler()
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽'
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                          {header.column.getCanFilter() ? (
                            <div className="mt-2">
                              <Filter column={header.column} />
                            </div>
                          ) : null}
                        </>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-700">
            {table.getRowModel().rows.map((row) => {
              return (
                <tr
                  className="transition-colors hover:bg-gray-800"
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td className="px-4 py-3" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="h-4" />
      <div className="flex flex-wrap items-center gap-2 text-gray-200">
        <button
          className="rounded-md bg-gray-800 px-3 py-1 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          type="button"
        >
          {'<<'}
        </button>
        <button
          className="rounded-md bg-gray-800 px-3 py-1 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          type="button"
        >
          {'<'}
        </button>
        <button
          className="rounded-md bg-gray-800 px-3 py-1 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          type="button"
        >
          {'>'}
        </button>
        <button
          className="rounded-md bg-gray-800 px-3 py-1 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          type="button"
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            className="w-16 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            type="number"
          />
        </span>
        <select
          className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          value={table.getState().pagination.pageSize}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 text-gray-400">
        {table.getPrePaginationRowModel().rows.length} Rows
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={() => rerender()}
          type="button"
        >
          Force Rerender
        </button>
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={() => refreshData()}
          type="button"
        >
          Refresh Data
        </button>
      </div>
      <pre className="mt-4 overflow-auto rounded-lg bg-gray-800 p-4 text-gray-300">
        {JSON.stringify(
          {
            columnFilters: table.getState().columnFilters,
            globalFilter: table.getState().globalFilter
          },
          null,
          2
        )}
      </pre>
    </div>
  )
}

function Filter({ column }: { column: Column<Person, unknown> }) {
  const columnFilterValue = column.getFilterValue()

  return (
    <DebouncedInput
      className="w-full rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-white outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={'Search...'}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
  )
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return (
    <input
      {...props}
      onChange={(e) => setValue(e.target.value)}
      value={value}
    />
  )
}
