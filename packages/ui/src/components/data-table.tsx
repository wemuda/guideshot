import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  ArrowUp01Icon,
  UnfoldMoreIcon,
} from '@hugeicons/core-free-icons'
import { Button } from '@guideshot/ui/components/button'
import { Icon } from '@guideshot/ui/components/icon'
import { Skeleton } from '@guideshot/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@guideshot/ui/components/table'
import { cn } from '@guideshot/ui/lib/utils'
import {
  type Cell,
  type Column,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type Row,
  type TableOptions,
  type Table as TanStackTable,
  useReactTable,
} from '@tanstack/react-table'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import * as React from 'react'

type DataTableRowModels =
  | 'getCoreRowModel'
  | 'getFacetedRowModel'
  | 'getFacetedUniqueValues'
  | 'getFilteredRowModel'
  | 'getPaginationRowModel'
  | 'getSortedRowModel'

type DataTableScrollMode = 'page' | 'page-sticky' | 'contained'

type UseDataTableOptions<TData> = Omit<TableOptions<TData>, DataTableRowModels>

function useDataTable<TData>(options: UseDataTableOptions<TData>) {
  return useReactTable({
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...options,
  })
}

type DataTableProps<TData> = Omit<React.ComponentProps<'div'>, 'children'> & {
  empty: React.ReactNode
  footer?: React.ReactNode
  getCellClassName?: (cell: Cell<TData, unknown>) => string | undefined
  getHeaderClassName?: (header: Header<TData, unknown>) => string | undefined
  getResizeColumnLabel?: (column: Column<TData, unknown>) => string
  getRowClassName?: (row: Row<TData>) => string | undefined
  isLoading?: boolean
  loadingRowCount?: number
  onRowClick?: (
    row: Row<TData>,
    event: React.MouseEvent<HTMLTableRowElement>
  ) => void
  resizeColumnStep?: number
  renderHeader?: (header: Header<TData, unknown>) => React.ReactNode
  selectionToolbar?: React.ReactNode
  selectionToolbarLabel?: string
  showHeader?: boolean
  scrollMode?: DataTableScrollMode
  surfaceClassName?: string
  table: TanStackTable<TData>
  tableLabel: string
  toolbar?: React.ReactNode
}

function DataTable<TData>({
  className,
  empty,
  footer,
  getCellClassName,
  getHeaderClassName,
  getResizeColumnLabel,
  getRowClassName,
  isLoading = false,
  loadingRowCount = 5,
  onRowClick,
  resizeColumnStep = 8,
  renderHeader,
  selectionToolbar,
  selectionToolbarLabel,
  showHeader = true,
  scrollMode = 'page',
  surfaceClassName,
  table,
  tableLabel,
  toolbar,
  ...props
}: DataTableProps<TData>) {
  const visibleColumns = table.getVisibleLeafColumns()
  const rows = table.getRowModel().rows
  const surfaceRef = React.useRef<HTMLDivElement>(null)
  const stickyOverlayRef = React.useRef<HTMLDivElement>(null)
  const stickyRef = React.useRef<HTMLDivElement>(null)
  const tableRef = React.useRef<HTMLTableElement>(null)
  const stickyHeaderMetrics = useStickyHeaderMetrics({
    enabled: scrollMode === 'page-sticky' && showHeader,
    surfaceRef,
    stickyRef,
    tableRef,
  })
  const renderTableHeader = (isStickyCopy = false) => (
    <TableHeader
      className={cn(
        showHeader ? undefined : 'sr-only',
        scrollMode === 'contained' && showHeader && 'sticky top-0 z-10'
      )}
      aria-hidden={isStickyCopy || undefined}
    >
      {table.getHeaderGroups().map(headerGroup => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header, headerIndex) => (
            <TableHead
              key={header.id}
              colSpan={header.colSpan}
              className={cn('relative', getHeaderClassName?.(header))}
              style={getColumnWidth(table, header.column)}
            >
              {header.isPlaceholder
                ? null
                : (renderHeader?.(header) ??
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  ))}
              {!isStickyCopy &&
              getResizeColumnLabel &&
              header.column.getCanResize() &&
              headerIndex < headerGroup.headers.length - 1 ? (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label={getResizeColumnLabel(header.column)}
                  aria-valuenow={Math.round(header.column.getSize())}
                  tabIndex={0}
                  className={cn(
                    'group/resize absolute inset-y-0 -right-1.5 z-10 flex w-3 cursor-col-resize touch-none select-none items-center justify-center outline-none',
                    'focus-visible:ring-2 focus-visible:ring-ring/30',
                    header.column.getIsResizing() && 'bg-primary/5'
                  )}
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  onDoubleClick={() => header.column.resetSize()}
                  onClick={event => event.stopPropagation()}
                  onKeyDown={event => {
                    if (
                      event.key !== 'ArrowLeft' &&
                      event.key !== 'ArrowRight'
                    ) {
                      return
                    }

                    event.preventDefault()
                    const direction = event.key === 'ArrowRight' ? 1 : -1
                    resizeColumn(
                      table,
                      header.column,
                      direction * resizeColumnStep
                    )
                  }}
                >
                  <span className="h-1/2 w-px rounded-full bg-border transition-all group-hover/resize:h-2/3 group-hover/resize:w-0.5 group-hover/resize:bg-primary group-focus-visible/resize:h-2/3 group-focus-visible/resize:w-0.5 group-focus-visible/resize:bg-primary" />
                </div>
              ) : null}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )

  React.useLayoutEffect(() => {
    stickyOverlayRef.current
      ?.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]'
      )
      .forEach(control => {
        control.tabIndex = -1
      })
  })

  return (
    <div
      data-slot="data-table"
      className={cn(
        '@container/data-table flex min-h-0 min-w-0 flex-col gap-3',
        scrollMode === 'contained' && 'h-full flex-1',
        className
      )}
      aria-busy={isLoading}
      {...props}
    >
      {scrollMode === 'page-sticky' ? (
        <div
          ref={stickyRef}
          className={cn(
            'sticky top-[var(--page-sticky-top,0px)] z-20 bg-canvas',
            toolbar ? '-mb-3 pb-3' : 'h-0 -mb-3'
          )}
        >
          {toolbar}
          {stickyHeaderMetrics ? (
            <div
              ref={stickyOverlayRef}
              className={cn(
                'pointer-events-auto absolute top-full left-0 overflow-hidden rounded-t-lg border-x border-t border-card-border bg-surface',
                !stickyHeaderMetrics.isStuck && 'invisible'
              )}
              onMouseDownCapture={event => event.preventDefault()}
              onClick={event => event.stopPropagation()}
              style={{
                height: stickyHeaderMetrics.headerHeight,
                width: stickyHeaderMetrics.surfaceWidth,
              }}
            >
              <table
                aria-hidden="true"
                className="table-fixed caption-bottom text-cell"
                style={{
                  transform: `translateX(-${stickyHeaderMetrics.scrollLeft}px)`,
                  width: stickyHeaderMetrics.tableWidth,
                }}
              >
                <colgroup>
                  {stickyHeaderMetrics.columnWidths.map((width, index) => (
                    <col key={index} style={{ width }} />
                  ))}
                </colgroup>
                {renderTableHeader(true)}
              </table>
            </div>
          ) : null}
        </div>
      ) : (
        toolbar
      )}
      <div
        className={cn(
          'relative min-h-0 min-w-0',
          scrollMode === 'contained' && 'flex flex-1 flex-col'
        )}
      >
        <div
          ref={surfaceRef}
          className={cn(
            'min-w-0 rounded-lg border border-card-border bg-surface',
            scrollMode === 'contained'
              ? 'min-h-0 flex-1 overflow-auto overscroll-x-contain scroll-pt-[var(--row-h)]'
              : 'overflow-x-auto overflow-y-clip overscroll-x-contain',
            surfaceClassName
          )}
        >
          <Table
            ref={tableRef}
            aria-label={tableLabel}
            className="table-auto"
            containerClassName="overflow-visible"
          >
            {renderTableHeader()}
            <TableBody>
              {isLoading
                ? Array.from({ length: loadingRowCount }, (_, rowIndex) => (
                    <TableRow key={`loading-${rowIndex}`} aria-hidden="true">
                      {visibleColumns.map(column => (
                        <TableCell key={column.id}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      className={getRowClassName?.(row)}
                      onClick={event => onRowClick?.(row, event)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={getCellClassName?.(cell)}
                          style={getColumnWidth(table, cell.column)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              {!isLoading && rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={Math.max(visibleColumns.length, 1)}
                    className="h-48 overflow-visible p-0 text-center whitespace-normal text-muted-foreground"
                  >
                    <div className="flex min-h-48 w-full">{empty}</div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <DataTableSelectionToolbar label={selectionToolbarLabel ?? tableLabel}>
          {selectionToolbar}
        </DataTableSelectionToolbar>
      </div>
      {footer}
    </div>
  )
}

type StickyHeaderMetrics = {
  columnWidths: number[]
  headerHeight: number
  isStuck: boolean
  scrollLeft: number
  surfaceWidth: number
  tableWidth: number
}

function useStickyHeaderMetrics({
  enabled,
  surfaceRef,
  stickyRef,
  tableRef,
}: {
  enabled: boolean
  surfaceRef: React.RefObject<HTMLDivElement | null>
  stickyRef: React.RefObject<HTMLDivElement | null>
  tableRef: React.RefObject<HTMLTableElement | null>
}) {
  const [metrics, setMetrics] = React.useState<StickyHeaderMetrics>()

  React.useLayoutEffect(() => {
    if (!enabled) {
      setMetrics(undefined)
      return
    }

    const surface = surfaceRef.current
    const sticky = stickyRef.current
    const table = tableRef.current
    const header = table?.tHead
    const leafHeaderRow = header?.rows.item(header.rows.length - 1)
    if (!surface || !sticky || !table || !header || !leafHeaderRow) return

    const updateMetrics = () => {
      const columnWidths = Array.from(
        leafHeaderRow.cells,
        cell => cell.getBoundingClientRect().width
      )
      const next = {
        columnWidths,
        headerHeight: header.getBoundingClientRect().height,
        isStuck:
          header.getBoundingClientRect().top <=
          sticky.getBoundingClientRect().bottom,
        scrollLeft: surface.scrollLeft,
        surfaceWidth: surface.clientWidth,
        tableWidth: table.getBoundingClientRect().width,
      }

      setMetrics(current =>
        current &&
        current.headerHeight === next.headerHeight &&
        current.isStuck === next.isStuck &&
        current.scrollLeft === next.scrollLeft &&
        current.surfaceWidth === next.surfaceWidth &&
        current.tableWidth === next.tableWidth &&
        current.columnWidths.length === next.columnWidths.length &&
        current.columnWidths.every(
          (width, index) => width === next.columnWidths[index]
        )
          ? current
          : next
      )
    }

    const updateStickyState = () => {
      const isStuck =
        header.getBoundingClientRect().top <=
        sticky.getBoundingClientRect().bottom
      setMetrics(current =>
        current && current.isStuck !== isStuck
          ? { ...current, isStuck }
          : current
      )
    }

    updateMetrics()
    surface.addEventListener('scroll', updateMetrics, { passive: true })
    window.addEventListener('scroll', updateStickyState, true)
    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(surface)
    resizeObserver.observe(table)
    resizeObserver.observe(header)

    return () => {
      surface.removeEventListener('scroll', updateMetrics)
      window.removeEventListener('scroll', updateStickyState, true)
      resizeObserver.disconnect()
    }
  }, [enabled, surfaceRef, stickyRef, tableRef])

  return metrics
}

type DataTableSelectionToolbarProps = {
  children?: React.ReactNode
  className?: string
  label: string
}

function DataTableSelectionToolbar({
  children,
  className,
  label,
}: DataTableSelectionToolbarProps) {
  const reducedMotion = useReducedMotion()
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const [pinToViewport, setPinToViewport] = React.useState(false)
  const [viewportBox, setViewportBox] = React.useState<{
    left: number
    width: number
  }>()

  React.useLayoutEffect(() => {
    if (!children) return

    const update = () => {
      const container = toolbarRef.current?.parentElement
      if (!container) return

      const rect = container.getBoundingClientRect()
      const viewport = window.visualViewport
      const viewportBottom = viewport
        ? viewport.offsetTop + viewport.height
        : window.innerHeight
      const offset = 12
      const shouldPin =
        rect.bottom > viewportBottom - offset &&
        rect.top < viewportBottom - offset

      setPinToViewport(shouldPin)
      setViewportBox({ left: rect.left, width: rect.width })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)

    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [children])

  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.div
          ref={toolbarRef}
          key="selection-toolbar"
          className={cn(
            'pointer-events-none z-20 flex justify-center px-3',
            pinToViewport ? 'fixed bottom-3' : 'absolute inset-x-0 bottom-3',
            className
          )}
          style={
            pinToViewport && viewportBox
              ? { left: viewportBox.left, width: viewportBox.width }
              : undefined
          }
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1] as const,
                }
          }
        >
          <div className="pointer-events-auto w-fit min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-floating">
            <div
              role="toolbar"
              aria-label={label}
              className="scroll-fade-x scroll-fade-4 min-w-0 overflow-x-auto overscroll-x-contain p-1.5"
            >
              <div className="w-max">{children}</div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function getColumnWidth<TData>(
  table: TanStackTable<TData>,
  column: Column<TData, unknown>
) {
  const hasWidth =
    Boolean(column.columnDef.size) ||
    table.getState().columnSizing[column.id] !== undefined
  return hasWidth ? { width: `${column.getSize()}px` } : undefined
}

function resizeColumn<TData>(
  table: TanStackTable<TData>,
  column: Column<TData, unknown>,
  change: number
) {
  const minimum = column.columnDef.minSize ?? 20
  const maximum = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER
  const size = Math.min(maximum, Math.max(minimum, column.getSize() + change))

  table.setColumnSizing(current => ({ ...current, [column.id]: size }))
}

type DataTableColumnHeaderLabels = {
  clearSorting: string
  sortAscending: string
  sortDescending: string
}

type DataTableColumnHeaderProps<TData, TValue> = Omit<
  React.ComponentProps<typeof Button>,
  'children' | 'onClick' | 'title'
> & {
  column: Column<TData, TValue>
  labels: DataTableColumnHeaderLabels
  title: React.ReactNode
}

function DataTableColumnHeader<TData, TValue>({
  className,
  column,
  labels,
  title,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted()

  if (!column.getCanSort()) {
    return <span className={cn('font-medium', className)}>{title}</span>
  }

  const nextSorting = column.getNextSortingOrder()
  const actionLabel =
    nextSorting === 'asc'
      ? labels.sortAscending
      : nextSorting === 'desc'
        ? labels.sortDescending
        : labels.clearSorting

  const sortIcon =
    sorted === 'asc'
      ? ArrowUp01Icon
      : sorted === 'desc'
        ? ArrowDown01Icon
        : UnfoldMoreIcon

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn('-ml-2 h-auto min-h-0 max-w-full py-0.5', className)}
      aria-label={actionLabel}
      onClick={() => {
        if (nextSorting === false) {
          column.clearSorting()
          return
        }

        column.toggleSorting(nextSorting === 'desc')
      }}
      {...props}
    >
      <span className="min-w-0 truncate">{title}</span>
      <Icon icon={sortIcon} />
    </Button>
  )
}

type DataTablePaginationLabelValues = {
  from: number
  page: number
  pageCount: number
  to: number
  total: number
}

type DataTablePaginationLabels = {
  firstPage: string
  lastPage: string
  nextPage: string
  page: (
    values: Pick<DataTablePaginationLabelValues, 'page' | 'pageCount'>
  ) => React.ReactNode
  previousPage: string
  range: (
    values: Pick<DataTablePaginationLabelValues, 'from' | 'to' | 'total'>
  ) => React.ReactNode
  rowsPerPage: string
}

type DataTablePaginationProps<TData> = Omit<
  React.ComponentProps<'div'>,
  'children'
> & {
  labels: DataTablePaginationLabels
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  table: TanStackTable<TData>
  totalRowCount?: number
}

function DataTablePagination<TData>({
  className,
  labels,
  pageSizeOptions = [15, 25, 50, 100, 200],
  showPageSizeSelector = true,
  table,
  totalRowCount,
  ...props
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const total = totalRowCount ?? table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)
  const pageCount = Math.max(table.getPageCount(), 1)
  const options = Array.from(new Set([...pageSizeOptions, pageSize])).sort(
    (left, right) => left - right
  )

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        'flex min-w-0 flex-nowrap items-center justify-between gap-2 px-3 text-caption text-text-meta',
        className
      )}
      {...props}
    >
      <span className="shrink-0 @md/data-table:hidden">
        <span aria-hidden="true">{total}</span>
        <span className="sr-only">{labels.range({ from, to, total })}</span>
      </span>
      <span className="hidden min-w-0 flex-1 truncate @md/data-table:block">
        {labels.range({ from, to, total })}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {showPageSizeSelector ? (
          <label className="hidden shrink-0 items-center gap-1.5 font-medium text-foreground @xs/data-table:flex">
            <span className="hidden @3xl/data-table:inline">
              {labels.rowsPerPage}
            </span>
            <select
              className="h-8 rounded-md border border-control-border bg-surface px-2 text-control outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={pageSize}
              onChange={event => table.setPageSize(Number(event.target.value))}
            >
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <span className="whitespace-nowrap text-center font-medium text-foreground">
          {labels.page({ page: pageIndex + 1, pageCount })}
        </span>
        <div className="flex items-center gap-1">
          <PaginationButton
            label={labels.firstPage}
            icon={ArrowLeftDoubleIcon}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="hidden @xl/data-table:inline-flex"
          />
          <PaginationButton
            label={labels.previousPage}
            icon={ArrowLeft01Icon}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          />
          <PaginationButton
            label={labels.nextPage}
            icon={ArrowRight01Icon}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          />
          <PaginationButton
            label={labels.lastPage}
            icon={ArrowRightDoubleIcon}
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="hidden @xl/data-table:inline-flex"
          />
        </div>
      </div>
    </div>
  )
}

type PaginationButtonProps = {
  className?: string
  disabled: boolean
  icon: React.ComponentProps<typeof Icon>['icon']
  label: string
  onClick: () => void
}

function PaginationButton({
  className,
  disabled,
  icon,
  label,
  onClick,
}: PaginationButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={className}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon icon={icon} />
    </Button>
  )
}

export type {
  DataTableColumnHeaderLabels,
  DataTableColumnHeaderProps,
  DataTablePaginationLabels,
  DataTablePaginationProps,
  DataTableProps,
  DataTableScrollMode,
  DataTableSelectionToolbarProps,
  UseDataTableOptions,
}
export {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableSelectionToolbar,
  useDataTable,
}
