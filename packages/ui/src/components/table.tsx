import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'

type TableProps = React.ComponentProps<'table'> & {
  containerClassName?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, containerClassName, ...props },
  ref
) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        'relative w-full min-w-0 overflow-x-auto overflow-y-clip overscroll-x-contain',
        containerClassName
      )}
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn('w-full caption-bottom text-cell', className)}
        {...props}
      />
    </div>
  )
})

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'thead'>
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn('bg-table-head [&_tr]:border-b', className)}
      {...props}
    />
  )
})

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'tbody'>
>(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
})

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'tfoot'>
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn(
        'border-t border-separator bg-surface font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
})

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<'tr'>
>(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        'h-row border-b border-separator transition-colors duration-150 ease-out motion-reduce:transition-none hover:bg-canvas data-[state=selected]:bg-primary-soft',
        className
      )}
      {...props}
    />
  )
})

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'th'>
>(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        'h-row min-w-0 px-3 py-2 text-left align-middle text-column font-medium uppercase tracking-[0.04em] text-text-meta whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
})

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'td'>
>(function TableCell({ className, ...props }, ref) {
  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        'h-row min-w-0 px-3 py-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis [&>*]:min-w-0 [&>*]:max-w-full [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
})

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.ComponentProps<'caption'>
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn('mt-3 text-caption text-text-meta', className)}
      {...props}
    />
  )
})

export type { TableProps }
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}
