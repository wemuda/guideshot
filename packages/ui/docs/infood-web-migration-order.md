# infood-web migration order

This register records the completed migration from application-local UI,
Chakra UI, and Mantine to `@guideshot/ui`, including the ownership boundaries that
remain application-specific.

This is a historical implementation record, not the Infood Web visual profile
or proof that every workflow retained parity. Use the current
[Infood Web UI profile](../../infood-web/docs/ui-profile.md) for application
composition and [migration governance](migration-governance.md) for future
migration work.

The pre-migration inventory was measured on 2026-08-04 and remains fixed as the
baseline. Record new inventories as dated evidence rather than rewriting the
historical counts.

## Baseline

- `packages/infood-web/src/components/ui` contains 46 files.
- Local `components/ui/*` paths have 1,001 source references across 407 files.
- Six authenticated-shell source files import `@guideshot/ui`. The root stylesheet
  imports the shared global CSS contract.
- Chakra is imported by 47 source files.
- Mantine is imported by 5 source files, including the root provider.
- `InfoodTable` contains 33 files and 8,811 lines. Its 54 consumers span 12
  product areas.
- Recharts appears in the shared local chart file and 13 chart call sites.
  Nivo appears in 6 specialized chart call sites.

The product-area inventory records source files, files using local UI, and
files using the legacy providers or data-display implementations.

| Product area | Source files | Local UI | Chakra | Mantine | Table | Chart |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Account | 20 | 13 | 7 | 0 | 0 | 0 |
| AI chat | 14 | 3 | 0 | 0 | 1 | 1 |
| Assistant | 7 | 3 | 1 | 0 | 0 | 0 |
| ESG | 26 | 16 | 4 | 0 | 3 | 6 |
| Food waste | 4 | 3 | 0 | 0 | 1 | 0 |
| Home | 13 | 1 | 0 | 0 | 0 | 4 |
| Inventory | 14 | 12 | 0 | 0 | 4 | 1 |
| Invoices | 59 | 36 | 9 | 0 | 5 | 0 |
| Kickback | 16 | 8 | 0 | 0 | 0 | 0 |
| Kitchen | 8 | 6 | 0 | 0 | 0 | 0 |
| Menu | 169 | 104 | 1 | 0 | 8 | 2 |
| Modules | 68 | 44 | 5 | 1 | 12 | 0 |
| Organic accounting | 35 | 12 | 2 | 0 | 3 | 1 |
| Products | 10 | 8 | 0 | 0 | 4 | 0 |
| Purchases | 121 | 69 | 1 | 1 | 11 | 4 |
| Suppliers | 22 | 17 | 1 | 0 | 1 | 0 |

Global components add 179 source files, including 22 local-UI consumers, 12
Chakra consumers, 2 Mantine consumers, 6 table consumers, and 1 chart
consumer. The authenticated app shell is handled first. Login, signup, public
display, unverified-email, and remaining global components stay in the final
phase because they participate in root-provider removal.

## Completion inventory

The 2026-08-13 implementation checkpoint has zero local `components/ui` files,
zero Chakra and Mantine imports, zero legacy `InfoodTable` files, zero
`AppPage` or `PageWrapper` consumers, and no compatibility-surface marker or
scoped reset. Shared UI is imported by 541 source files. The app-owned
`infood-data-table` composition retains persistence, translated filters,
exports, routing, actions, and domain-specific narrow layouts on shared table
foundations.

## Post-migration review

The 2026-08-13 checkpoint proved structural adoption: local generic primitives,
legacy providers, and compatibility CSS were removed. It did not prove full
behavior parity or presentation readiness. Subsequent review found failures
that static checks and import inventories could not detect:

- shared font, radius, icon, theme, and primitive behavior rendered differently
  when app root CSS, resets, provider order, or local overrides drifted;
- routes imitated page headers, tabs, commands, empty states, cards, dialogs,
  and sheets instead of using the complete shared anatomy;
- global search, breadcrumbs, page actions, export actions, and primary actions
  appeared in the wrong scope or more than once;
- overlays exceeded the viewport, lost reachable actions, escaped inset sheet
  clipping, or used a dialog where the workflow required a nested sheet;
- table migration changed reset semantics, persisted-setting precedence,
  initial sorting, filter focus, export visibility, and compact behavior;
- route transitions briefly duplicated header controls or interfered with
  navigation, and theme initialization produced light flashes;
- viewport-only inspection missed failures caused by a narrow component inside
  a wide viewport.

The process failure was treating a large structural conversion and green checks
as a completed user experience. Future brownfield work must use bounded vertical
slices, capture the behavior parity ledger before deletion, fix repeated defects
at their owning layer, and prove structural, product-contract, interaction, and
presentation dimensions independently.

### 2026-08-14 icon consistency correction

The post-migration icon inventory found 220 source files resolving icon data
from `@hugeicons/core-free-icons` 1.0.11 and 84 resolving a v4 package alias.
The old data contains filled geometry while v4 contains the canonical Free
Stroke Rounded geometry, so the shared renderer's `1.5` stroke width could not
make the two families visually consistent.

| Contract | Before evidence | Owner | Shared replacement | Required states and interactions | After evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Icon meaning and behavior | Existing named exports, domain maps, sizes, colors, accessible names, and control hit targets | Infood Web | The same named exports from the canonical v4 data package through `Icon` | Navigation, actions, statuses, disabled controls, and icon-only accessible names remain intact | Frontend typechecks passed; authenticated Purchases, Booking, account settings, theme selection, and mobile navigation review preserved the existing contracts | Complete |
| Generic icon family and weight | Mixed filled 1.0.11 geometry, rounded-stroke v4 geometry, a sidebar `1.25` CSS rule, and invoice `stroke-2` classes | `@guideshot/ui` | One Free Stroke Rounded package and the shared fixed `1.5` contract | Desktop, 390px, 320px, light theme, and dark theme retain clear glyphs without weight drift | Import audit and design-system boundary checks passed; authenticated Chrome found only `1.5px` root and child strokes, no painted descendants, and no horizontal overflow at every reviewed viewport and theme | Complete |

## Component register

The local file groups below are migration units, not permission to create new
local equivalents.

| Local inventory | Main consumers | Shared target or decision | Completion condition |
| --- | --- | --- | --- |
| `Badge`, `Button`, `Card`, `Dialog`, `Input`, `Label`, `Skeleton`, `tooltip` | Cross-product | Existing `@guideshot/ui` primitives | Every import uses the shared primitive and the local file is deleted. |
| `empty`, `Loader`, `MessageBox` | Empty, loading, and error states | `EmptyState`, `ErrorState`, `Spinner`, or app composition | Product copy remains local and the generic files have no consumers. |
| `Hugeicon`, `Icon`, `assets/icons` | Cross-product | Shared `Icon` and canonical Hugeicons | One-off replacements are removed after visual and accessible-name review. |
| `Page`, `Breadcrumb` | Screen headers and content | Shared layout primitives through the registered `app-shell/AppPage` compatibility composition | Routing and translated copy remain app-owned; screens move to direct shared layout composition as their product area migrates. |
| `Sidebar` | Product detail side panels | App-owned, feature-named composition | The generic collision is renamed or moved; it must not use the navigation-sidebar API. |
| `Accordion`, `Calendar`, `Checkbox`, `Command`, `DatePicker`, `Drawer`, `DropdownMenu`, `NumberInput`, `Popover`, `radio-group`, `select`, `Slider`, `switch`, `Tabs`, `Textarea` | Forms, filters, and overlays | Promote the application-independent primitive before its first area migrates | The last local consumer is migrated and the local primitive is deleted. |
| `Chart`, `table` | Charts and simple semantic tables | Shared chart and table foundations | Local styling wrappers have no consumers. Renderer imports remain allowed. |
| `Kbd`, `SegmentTabs`, `Settings`, `alert`, `bubble`, `collapsible`, `progress`, `resizable`, `scroll-area` | Mixed feature compositions | Classify as shared primitive or move beside the owning feature | No generic application-local UI file remains. |

## Provider and dependency register

| Provider or dependency | Current consumers | Migration condition | Removal condition |
| --- | --- | --- | --- |
| Shared CSS and Tailwind 4 | Root stylesheet and all app routes | Keep one Tailwind 4 Vite pipeline and map retained app aliases to shared semantic tokens in `index.css` | Complete. The JavaScript config and compatibility surface are removed. |
| ChakraProvider and `chakraTheme` | 0 source files | Migrated by product area | Complete. Provider, theme, reset behavior, and dependency are removed. |
| MantineProvider and global styles | 0 source files | Replaced functional consumers with shared or app-owned compositions | Complete. Provider, CSS imports, and dependencies are removed. |
| Shared TooltipProvider | Shared tooltip consumers across the app | Keep one measured application delay policy | Complete. No local tooltip implementation remains. |
| Local toaster | Cross-product mutations and feedback | Add or adopt a shared toast primitive before migrating call sites | Local toaster has zero consumers and translated messages remain app-owned. |
| TanStack Table | App-owned `infood-data-table` composition and direct domain tables | Use the shared foundation and app-owned compositions | Complete. The legacy schema-driven implementation is removed; TanStack remains an application peer dependency. |
| Recharts | 13 chart call sites plus the local chart wrapper | Compose chart primitives inside the shared chart container | Keep as an application peer dependency. Delete only the local chart wrapper; upgrade to Recharts 3 behind a separate all-chart compatibility gate. |
| Nivo | 6 bump, geo, line, pie, and Sankey call sites | Apply shared palette and layout; replace only when Recharts has equivalent behavior | Remove an individual Nivo package only when its final direct consumer is gone. No blanket rewrite is required. |
| Auth0, Redux, RTK Query, router, i18n | Application infrastructure | Not design-system migration targets | Remain app-owned. Their providers move only when necessary for shell composition. |

PDF styles, forward-table shadows, print rules, and other application-only CSS
remain in the application. Do not copy them into `@guideshot/ui` unless they are
application-independent.

## Compatibility boundary

- `src/index.css` imports `@guideshot/ui/globals.css` and compiles shared and
  application-owned utilities through the Tailwind 4 Vite plugin.
- Retained historical class names resolve through `@theme inline` aliases to
  shared semantic tokens. There is no app-local JavaScript Tailwind config.
- Shared theme, tooltip, layout, and generic primitives own the entire route
  tree and application-owned portals. There is no scoped reset or legacy
  surface marker.
- The production browser floor follows Tailwind 4: Chrome 111, Firefox 128,
  and Safari 16.4 or newer.

## Data-table boundary

The shared package now owns the semantic table primitive, standard TanStack
row models, table presentation, loading and empty placement, selected state,
column sizing, sortable headers, pagination, and token styling.

The infood-web composition continues to own:

- Redux and session-based table-state persistence;
- translated filter and pagination copy;
- schema-driven domain columns and custom filter functions;
- CSV/XLSX export and extra-sheet generation;
- row navigation, permissions, actions, and selection workflows;
- table/card switching and specialized mobile filter drawers.

The app-owned composition keeps simple status filters as inclusive string
arrays. Tables that need independent option-level inclusion and exclusion store
`{ include: string[], exclude: string[] }`, may seed visible default
exclusions, and keep domain option rendering and settings actions in the
consumer. This state shape remains application-owned and is not part of the
shared table primitive.

All former consumers now define explicit columns and the filters, faceting,
sorting, pagination, visibility, ordering, sizing, selection, loading and
empty states, toolbars, actions, exports, and narrow layouts they actually use.
The legacy schema-driven table has been deleted rather than copied into the
shared package.

## Chart boundary

The shared chart API owns configuration, responsive layout, semantic series
colors, tooltip and legend styling, zero-value and range formatting, and the
Recharts surface reset. Applications own data mapping, translated series
labels, axes, annotations, interaction, and chart selection.

Current Recharts use cases are line, area, composed, bar, pie, radial bar,
radar, and scatter charts. Current Nivo use cases add area bump, choropleth,
line, pie, and Sankey. The shared solution styles all of them through tokens,
but it does not wrap every renderer-specific primitive.

## Ordered phases

Each phase is a separate stacked pull request or a small sequence of stacked
pull requests. A phase starts only after its entry criteria are true and ends
only after its completion criteria are demonstrated.

| Phase | Scope | Entry criteria | Completion criteria |
| --- | --- | --- | --- |
| 0 | Compatibility foundation | The shared package is the source of truth and the inventory is current. | One Tailwind 4 pipeline compiles shared and legacy CSS; the scoped legacy surface preserves existing routes and portals at desktop and narrow widths; provider and removal gates are recorded. |
| 1 | Authenticated app shell and layout | The compatibility foundation is merged and shell routing, permissions, navigation, impersonation, loading, and chrome-less routes have explicit behavior checks. | Shared layout and navigation primitives own the shell; the current route body renders inside the bounded legacy surface; desktop and mobile navigation preserve behavior; no product page is redesigned. |
| 2 | Procurement pilot | The shared shell is stable and the pilot screens are named in the PR. | The chosen procurement slice uses shared primitives and data-display foundations, behavior and responsive states are verified, and no new legacy imports are added. |
| 3 | Complete Purchases, then Products, Suppliers, Inventory, and Food waste | Pilot adapters and gaps are recorded; common filters and actions have shared or app-owned homes. | The five areas have no avoidable local-UI imports; each table preserves its used persistence, filters, actions, exports, and mobile behavior. |
| 4 | Home, ESG, and Organic accounting | Shared chart styling is stable on procurement charts and every series has a semantic token assignment. | Recharts charts use the shared container, tooltip, legend, and tokens; Nivo charts use the shared palette; light/dark, empty, zero, and dense-label states are checked. |
| 5 | Invoices | Shared dialog, form, status, table, and loading patterns cover the invoice workflows. | Invoice lists, detail workflows, batch booking, associations, and resolution flows no longer depend on Chakra or replaceable local primitives. |
| 6 | Modules | The shared date-input decision is implemented and import/data-job tables have explicit behavior checklists. | Module tables and forms migrate; the Modules Mantine date picker is gone; imports, filtering, selection, and refresh states are verified. |
| 7 | Menu and Kitchen | Shared form, overlay, drag-and-drop boundary, and product-search dependencies are classified. | Menu's large form and table surface and Kitchen navigation use the shared system without moving recipe or meal-plan domain logic into the package. |
| 8 | Account, AI chat, Assistant, Kickback, auth/public screens, and global components | All product phases are complete and a fresh zero-import inventory identifies the final provider consumers. | Local generic UI files and the compatibility surface are removed; Chakra and Mantine imports are zero; obsolete providers, styles, themes, and dependencies are deleted; app-wide auth, loading, error, responsive, print, and impersonation smoke tests pass. |

## Pull request gates

Every migration pull request must:

1. follow the complete governance checklist and behavior parity ledger;
2. name the product area and exact legacy files it reduces;
3. record dated before-and-after import counts without rewriting the baseline;
4. preserve translated copy and all locale keys;
5. verify loading, empty, error, disabled, permission, responsive, keyboard,
   persistence, focus, scroll, and transition states that exist in the surface;
6. keep app infrastructure and domain mapping outside `packages/ui`;
7. delete an obsolete local file or register its bounded adapter and observable
   removal condition;
8. avoid unrelated visual redesign while behavior is being moved.

Provider removal is a final state, not a per-screen optimization. Keep the
coexistence providers until the corresponding zero-import condition is true,
then remove the provider and dependency in the same pull request.

Phases 0 through 8 are structurally complete. That status describes dependency
and import removal only. It must never be used as current evidence that an
untouched workflow, responsive state, or interaction is correct; re-establish
behavior and browser evidence for the slice being changed.
