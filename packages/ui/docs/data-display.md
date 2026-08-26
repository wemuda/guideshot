# Data display foundations

The shared table and chart APIs standardize visual behavior without absorbing
product logic. Applications still own queries, translated copy, column and
series definitions, permissions, navigation, exports, and domain formatting.

## Data tables

`useDataTable` applies the common TanStack Table row models for filtering,
faceting, sorting, and pagination. It accepts the normal TanStack options, so a
consumer can keep state local or control it from application persistence.

`DataTable` renders the shared table surface. Sorting controls, pagination,
toolbars, filters, empty content, and actions are composed around it instead of
being hidden behind one configuration object. This follows the
[shadcn data-table guidance](https://ui.shadcn.com/docs/components/radix/data-table),
which treats each product table as a composition rather than one universal
component API.

Use `showHeader={false}` only when an enclosing labelled surface supplies the
visible column context; the semantic header remains available to assistive
technology. Use `surfaceClassName` to join an embedded table to that surface
without rebuilding the table chrome.

Pass selected-row controls through `selectionToolbar` with a translated
`selectionToolbarLabel`. The shared table anchors them in an animated floating
surface at the bottom of the table, pinning to the viewport bottom when the
table extends below the fold. The floating surface remains bounded by the table
container; longer action sets scroll horizontally inside it with the standard
scroll fade. The application continues to own action availability, copy,
permissions, and effects.

```tsx
import type { ColumnDef } from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  useDataTable,
} from '@guideshot/ui'

function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'supplierName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('supplier')}
          labels={{
            sortAscending: t('sortAscending'),
            sortDescending: t('sortDescending'),
            clearSorting: t('clearSorting'),
          }}
        />
      ),
    },
  ]
  const table = useDataTable({ data: invoices, columns })

  return (
    <DataTable
      table={table}
      tableLabel={t('invoices')}
      empty={t('noInvoices')}
      getResizeColumnLabel={() => t('resizeColumn')}
      selectionToolbar={selectedRows.length > 0 ? bulkActions : null}
      selectionToolbarLabel={t('selectionActions')}
      footer={
        <DataTablePagination
          table={table}
          labels={{
            rowsPerPage: t('rowsPerPage'),
            range: ({ from, to, total }) =>
              t('rowRange', { from, to, total }),
            page: ({ page, pageCount }) =>
              t('pageCount', { page, pageCount }),
            firstPage: t('firstPage'),
            previousPage: t('previousPage'),
            nextPage: t('nextPage'),
            lastPage: t('lastPage'),
          }}
        />
      }
    />
  )
}
```

The shared foundation owns:

- the semantic HTML table and compact token-based styling, including `--row-h`
  cell padding and single-line truncated cells;
- TanStack core, filtered, faceted, sorted, and paginated row models;
- loading rows, selected-row styling, empty-content placement, opt-in mouse,
  touch, and keyboard column resizing, sorting controls, and pagination controls;
- horizontal scrolling on the table surface for wide columns, without a nested
  vertical scrollbar unless that surface is height-capped;
- opt-in single-scroll sticky behavior: `page-sticky` keeps the page as the
  vertical scroll owner and mirrors the visible header below the sticky table
  toolbar, while `contained` makes a height-constrained table surface the sole
  vertical scroll owner and keeps its real header sticky;
- the floating selected-row action surface and its reduced-motion-aware
  disclosure;
- controlled-state compatibility through the normal TanStack options.

Applications own:

- column definitions, filters, toolbar actions, and translated labels;
- query, server-pagination, and persistence integration;
- row navigation, permissions, bulk actions, and domain status mapping;
- CSV/XLSX export, card views, mobile-specific compositions, and extra sheets.

Keep `@tanstack/react-table` installed in each application. It is a peer
dependency because applications define columns and may compose its APIs
directly.

Use `onRowClick` only for an application-owned row interaction and keep the
row's destination or action keyboard-accessible through a link or button in
the row.

`infood-admin-web` composes its product-specific filtering toolbar in
`src/components/admin-data-table` and renders the shared `DataTable`,
`DataTableColumnHeader`, and `DataTablePagination`. This is an application
composition, not a second primitive implementation.

`data-core-web` follows the same boundary in `src/components/data-table`: its
filter metadata, custom filter registry, English toolbar copy, and query
refresh behavior remain application-owned, while the table surface, sorting
header, loading and empty states, selection styling, and pagination come from
`@guideshot/ui`.

### Table composition contract

Use `DataTableFilterPicker` for optional column filters. Keep inactive filters
behind one add-filter control, render only active or deliberately added filters,
open a newly added filter after the picker returns focus, and expose one reset
path. Consumers may default a commonly used filter to visible without applying
a filter value; users can still remove it, and reset restores that default
visibility. The application reset handler must clear every filter represented
by its label; if the table has global search and column filters, `Reset filters`
clears both.

The `DataTable` root is a named container. Compose toolbar and pagination
breakpoints with `@*/data-table` container variants so an embedded table
compacts when its own width is narrow, even on a wide browser viewport. Use
viewport variants only for page-level layout changes.

Keep the filtered result count and pagination controls on one row. Below the
medium table-container breakpoint, show the compact total while preserving the
full range copy for assistive technology. At the narrowest table width, omit
the page-size selector so pagination keeps its minimum touch targets.

Persisted table state needs an explicit precedence contract. A current shared
preference must not be shadowed by an old per-table snapshot, and an empty
persisted value must not erase a deliberate initial value. In Infood Web, the
shared rows-per-page value wins over persisted table page size, and empty
persisted sorting falls back to `initialSorting`. Add focused tests whenever
hydration, reset, or precedence changes.

Choose one vertical scroll owner. Use `scrollMode="contained"` only when the
table fills a height-constrained `PageContent` that also uses
`scrollMode="contained"`. Use `scrollMode="page-sticky"` when summaries,
charts, or other content must continue to use the page scrollbar. Do not put a
contained table inside a vertically scrolling page.

Export remains an application capability, not default table decoration. Render
it only when the consumer supplies export behavior and it belongs in the active
toolbar, or when the consumer explicitly requests a standalone export. Verify
column choice, visible-row and all-row behavior, locale formatting, file type,
loading, error, and narrow dialog containment.

For table migrations, exercise search alone, each filter type, search plus a
filter, reset, initial and changed sorting, page-size propagation, persisted
hydration, empty and no-match states, selection, row actions, export, and a
narrow container. A populated desktop screenshot is not table-parity evidence.

## Charts

The chart foundation follows the
[shadcn chart contract](https://ui.shadcn.com/docs/components/radix/chart): it
styles Recharts instead of replacing Recharts with a second chart API. The
application chooses the chart primitive and maps data; `ChartContainer`,
`ChartTooltipContent`, and `ChartLegendContent` provide the shared
configuration and visual contract.

```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@guideshot/ui'
import { Line, LineChart, XAxis } from 'recharts'

const chartConfig = {
  spend: {
    label: t('spend'),
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

<ChartContainer
  config={chartConfig}
  className="aspect-auto h-64 min-h-0"
  aria-label={t('spendOverTime')}
>
  <LineChart data={data} accessibilityLayer>
    <XAxis dataKey="month" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line dataKey="spend" stroke="var(--color-spend)" />
  </LineChart>
</ChartContainer>
```

Use the semantic `--chart-1` through `--chart-14` tokens or
`getChartColor(index)` for series. Configure labels in the application so they
remain translated. Add `accessibilityLayer` to each categorical Recharts chart
and provide a useful accessible name on the container.

Define the statistic before choosing the renderer. Interval values and
cumulative totals answer different questions; name that choice in the chart's
accessible label and tooltip. Add daily, weekly, monthly, or other view
controls only when each option performs a meaningful, accurate aggregation.
Remove controls that are no-ops, only thin the same samples, or make the chart
less faithful.

Keep the same domain series on the same semantic color across nearby and
canonical surfaces. Curve smoothing may improve readability, but it must not
invent observations, change the values shown in tooltips, or imply precision
the source data does not have. Align a populated legend or status breakdown to
the top of its supporting surface rather than centering it against a taller
chart.

Keep `recharts` installed in each application. Direct composition of line,
area, bar, pie, radial, radar, scatter, and composed charts is intentional.
Specialized Nivo renderers such as Sankey, choropleth, and bump charts remain
application-owned, but they should consume the shared palette and surrounding
layout tokens.

The first migration remains compatible with the current Recharts 2 renderer.
A Recharts 3 upgrade is a separate compatibility gate because all existing
chart call sites must be checked together.
