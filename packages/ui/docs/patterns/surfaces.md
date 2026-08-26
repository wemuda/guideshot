# Surface patterns

Classify a screen by the user's job before choosing its layout. A pattern is a
starting structure, not a template to copy unchanged.

## Shared page contract

- The header names the job and non-obvious scope.
- Page-wide scope and at most one primary action sit at page level.
- Controls that affect one region stay with that region.
- Content follows the user's decision order, not the API shape.
- A `Card` marks a coherent subject or task; it is not a default wrapper.
- Use `full` width for data workspaces, `wide` for mixed content, and `content`
  for focused forms or reading.

See [shell and layout](../shell-layout.md) for the component contract.
Use the [component dos and don'ts](../component-dos-and-donts.md) when choosing
containers, overlays, disclosure, controls, data display, or feedback.

## Choose a surface

| Surface | Use when | Default structure |
| --- | --- | --- |
| Portfolio overview | Compare many peer entities and decide where to act | Peer KPIs, dominant ranked table, narrower evidence rail, page-wide period |
| Quality overview | One valid aggregate explains contributing signals | Lead metric, peer signals, volume, trends, breakdown, page-wide scope |
| Collection | Find, compare, select, or manage records | Query and filters, table or list, selection actions, pagination, route to detail |
| Record detail | Understand and act on one object | Identity and status, primary action, summary, grouped detail, history |
| Form or settings | Create or change persistent state | Focused width, fields grouped by user concept, effect and save behavior |
| Operation | Run, retry, refresh, or repair work | Current state, target selection, consequence, command, progress, durable result |
| Workspace | Inspect or build a complex object | Task toolbar, main work surface, stable context or inspector, explicit status |

Do not turn a collection, detail page, form, or workspace into a dashboard card
grid merely because the Home screens are canonical.

## Canonical dashboard decisions

Admin `/home` is the portfolio reference. Peer KPIs share one anatomy, the
operating table receives more width than trends or activity, and local table
filters stay beside the table.

Data Core `/home` is the quality reference. Feature a lead metric only when it
truthfully summarizes the signals around it. Status uses text, progress has an
accessible name, and the reporting scope applies to the whole page.

Use the composition, not application copy, fixed metric counts, routing, or
domain logic. See the [canonical register](../canonical-examples.md).

## Forms, settings, and operations

Group persistent settings by the user's concept, not by backend service. State
scope, default, effect, and whether changes apply immediately or on save.

For operations, use checkboxes when a later command processes selected targets.
Keep the normal path dominant; separate force, reset, and all-tenant paths.
During execution, show what is running and whether navigation is safe. After it
finishes, show a durable result when a toast is insufficient.

## Interactive workspaces and boards

Make the work surface dominant and align supporting rails, summaries, and
status lists to its top. Center only a true empty state; do not vertically
center populated supporting content merely because the neighboring surface is
taller.

Treat drag and drop as a fast path, not the product contract. Keep the same
move, edit, and destructive actions available through an explicit menu or
form. A board must support pointer, touch, and keyboard operation where those
inputs apply.

The dragged item, placeholder, optimistic result, and server-settled result
must share one geometry:

- attach the drag engine's refs and attributes to the actual measured list and
  draggable DOM nodes, not component wrappers with different padding;
- preserve the exact destination lane and any order supported by the product
  contract immediately, including drops into occupied lanes. When order is not
  persisted, constrain the interaction to a deterministic supported position
  instead of implying reorder;
- use spacing the drag engine measures; if it ignores CSS `gap`, put the
  spacing on each draggable wrapper;
- keep pending feedback dimension-neutral so the item does not resize while
  saving;
- apply optional drag polish to an inner presentation surface, never the
  positioning wrapper. A subtle two-degree card tilt is acceptable when it
  does not alter measurement and the state remains clear without motion.

At narrow widths, keep a genuinely two-dimensional board in a contained
horizontal scroller and stack supporting regions below it. Do not squeeze all
lanes into unreadable columns or create page-level horizontal overflow.

## Narrow screens

Stack actions and regions without changing semantic order. Card footers wrap or
stack. Wide tables need an explicit choice: contained horizontal scrolling,
fewer columns, row cards, or a detail-first view. A desktop rail becomes a
single column rather than a squeezed second column.

Use [data display](../data-display.md) for table and chart mechanics and
[core primitives](../core-primitives.md) for controls and states.
