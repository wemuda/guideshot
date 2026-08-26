# Design-system evaluations

Use fresh-agent scenarios to find gaps in the written ground truth. Do not
coach with unwritten preferences during a run.

## Protocol

1. Give a fresh agent one scenario and the normal repository instructions.
2. Require its brief before implementation.
3. For a migration scenario, require a completed behavior parity ledger with
   before evidence before any legacy implementation is removed.
4. Capture desktop and 390px evidence plus relevant states. Add 320px evidence
   when the scenario changes shared primitives, shell, layout, or reflow.
5. Apply every review gate in [agent workflow](agent-workflow.md).
6. Treat any failed gate as a failed run; record which document was unclear.

## Scenario set

- **Collection:** redesign a dense supplier list with search, semantic filters,
  selection, bulk action, row detail, empty and error states.
- **Record detail:** compose an invoice-parsing detail screen with identity,
  status, document view, extracted data, issues, and history.
- **Operation:** select caches to refresh, separate a force-all-tenants path,
  and show consequences, running state, failure, and durable completion.
- **Interactive workspace:** manage cards across empty and occupied workflow
  lanes with pointer and keyboard drag, an explicit action-menu fallback,
  prefilled editing, optimistic updates, mutation failure, and a supporting
  notes rail. Require contained narrow-screen board scrolling.
- **Quality overview:** present one aggregate parser score, contributing
  signals, volume, trends, and a scoped breakdown.
- **Responsive stress:** use long copy, a scope control, primary action, wide
  data, and two card actions at 390px and the 320px reflow boundary.
- **Brownfield migration:** replace a legacy collection route and nested detail
  overlay with shared shell, page, table, filter, empty-state, and sheet
  primitives. Preserve routes, permissions, query parameters, translated copy,
  global and column filter reset, initial sorting, rows-per-page persistence,
  exports, focus restoration, and the nested inspection flow. Include long
  content, dark first paint, a route transition, a narrow embedded table on a
  wide viewport, and a staging behavior change that must be recreated rather
  than discarded during conflict resolution.

A run fails immediately if it copies an unclassified screen as precedent,
recreates a shared primitive, violates a **Must**, departs from a **Default**
without the required exception record, clips a required action, omits recovery
from an expected failure, hand-maintains a skeleton that could render the real
component through `AutoSkeleton`, retains a no-op or fidelity-reducing control,
changes selected-option typography, animates unchanged actions, lets an optimistic
object snap to a different geometry after settlement, or claims validation
that was not performed. A migration run also fails if it edits before recording
the old contract, treats zero legacy imports as behavior proof, changes product
behavior without explicit scope, patches a repeated shared defect locally,
uses viewport queries for a container-owned composition, shows duplicate route
controls during transition, loses the persisted theme before first paint, or
validates a shared fix in only one affected app. A reasoned **Prefer** departure
is not a failure.

Record the agent and model, commit, screenshots, failed gates, and resulting
documentation change. Compare revisions with the same scenario set.
