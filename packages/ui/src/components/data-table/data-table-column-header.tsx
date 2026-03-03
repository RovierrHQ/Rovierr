'use client'

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Sorting01Icon,
  ViewOffIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { cn } from '@rov/ui/lib/utils'
import type { Column } from '@tanstack/react-table'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>
  label: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!(column.getCanSort() || column.getCanHide())) {
    return <div className={cn(className)}>{label}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          '-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
          className
        )}
        {...props}
      >
        {label}
        {column.getCanSort() &&
          (column.getIsSorted() === 'desc' ? (
            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
          ) : column.getIsSorted() === 'asc' ? (
            <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
          ) : (
            <HugeiconsIcon icon={Sorting01Icon} strokeWidth={2} />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-28">
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              checked={column.getIsSorted() === 'asc'}
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              onClick={() => column.toggleSorting(false)}
            >
              <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
              Asc
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={column.getIsSorted() === 'desc'}
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              onClick={() => column.toggleSorting(true)}
            >
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
              Desc
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuItem
                className="pl-2 [&_svg]:text-muted-foreground"
                onClick={() => column.clearSorting()}
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                Reset
              </DropdownMenuItem>
            )}
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuCheckboxItem
            checked={!column.getIsVisible()}
            className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
            onClick={() => column.toggleVisibility(false)}
          >
            <HugeiconsIcon icon={ViewOffIcon} strokeWidth={2} />
            Hide
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
