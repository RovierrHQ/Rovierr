import type { DataTableConfig } from '@rov/ui/config/data-table'
import type { FilterItemSchema } from '@rov/ui/lib/parsers'
import type { ColumnSort, Row, RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // biome-ignore lint/style/useConsistentTypeDefinitions: required by react-table
  interface TableMeta<TData extends RowData> {
    queryKeys?: QueryKeys
  }

  // biome-ignore lint/style/useConsistentTypeDefinitions: required by react-table
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    placeholder?: string
    variant?: FilterVariant
    options?: Option[]
    range?: [number, number]
    unit?: string
    icon?: React.FC<React.SVGProps<SVGSVGElement>>
  }
}

export type QueryKeys = {
  page: string
  perPage: string
  sort: string
  filters: string
  joinOperator: string
}

export type Option = {
  label: string
  value: string
  count?: number
  icon?: React.FC<React.SVGProps<SVGSVGElement>>
}

export type FilterOperator = DataTableConfig['operators'][number]
export type FilterVariant = DataTableConfig['filterVariants'][number]
export type JoinOperator = DataTableConfig['joinOperators'][number]

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
  id: Extract<keyof TData, string>
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>
}

export type DataTableRowAction<TData> = {
  row: Row<TData>
  variant: 'update' | 'delete'
}
