# Migration governance

`@guideshot/ui` is the canonical home for application-independent UI.
`infood-web`, `infood-admin-web`, and `data-core-web` have completed their
primitive migrations and must not recreate local UI trees.

This policy is enforced through code review, agent guidance, and
`pnpm check:ui-boundaries` in local hooks and CI. The boundary check prevents
the migrated applications from recreating `src/components/ui` and prevents the
shared package from importing application code.

All three web applications use Geist, the shell tokens, Hugeicons Free Stroke
Rounded, and shared primitives. A recreated local generic UI tree or a new
direct generic-icon renderer is a regression.

Zero legacy imports prove structural adoption, not behavior parity, visual
quality, or release readiness. Typechecks and boundary checks cannot prove that
a route still navigates correctly, a filter resets fully, an overlay scrolls,
or the right control appears for the right permission.

## Migration is not redesign

Classify the task before touching code:

| Mode | Frozen contract | Allowed change |
| --- | --- | --- |
| Design-system migration | Routing, permissions, queries, mutations, persistence, translated copy, domain mapping, workflows, and information availability | Replace generic UI mechanics and presentation with the shared system. |
| Page rebuild | The same product and data contracts | Recompose hierarchy and presentation deliberately through `$rebuild-infood-page`. |
| Feature change | Every behavior outside the explicit requirement | Change the named product behavior and record its old and new contract. |

Do not use migration as implied permission to clean up, simplify, remove,
relocate, or add product behavior. An existing screen can be poor visual
evidence and still be authoritative behavior evidence. Record suspected no-op,
duplicate, or confusing behavior separately and ask for a product decision when
changing it would affect navigation, action availability, saved state, or data.

## Rules for agents

1. Check the exports and documentation in `packages/ui` before creating a UI
   component.
2. When a shared equivalent exists, import it from `@guideshot/ui`. Do not add a
   new local implementation or a new consumer of the legacy equivalent.
3. If the target application has not adopted `@guideshot/ui/globals.css`, treat
   that as an adoption dependency. Do not copy the shared component into the
   application to bypass it.
4. Add a missing application-independent primitive to `packages/ui`, including
   its accessibility contract and documentation.
5. Keep domain components and feature compositions beside their feature,
   outside `src/components/ui`.
6. Keep routing, queries, permissions, translated copy, and domain mapping in
   the application. The shared package owns visual behavior and composition,
   not product infrastructure.
7. Update the register below in the same pull request whenever a migration,
   exception, or adapter changes.
8. Fix repeated visual or interaction defects at the layer that owns the
   contract. Do not patch each consumer with route-local CSS.
9. Keep migration slices reviewable. Do not combine unrelated product areas,
   provider removal, visual redesign, and new feature behavior in one proof unit.

Use direct package imports for shared components:

```tsx
import { Button } from '@guideshot/ui/components/button'
import { Page, PageContent } from '@guideshot/ui/components/layout'
```

## Behavior parity ledger

Create this ledger before implementation for every migrated shell, route,
workflow, or reusable composition. Populate it from the current code and a
running before state; do not reconstruct the old contract from memory after it
has been deleted.

| Contract | Before evidence | Owner | Shared replacement | Required states and interactions | After evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Example: table reset | Search and column filters both clear | Application composition | Shared filter picker plus app reset handler | Search only, column only, both active, persisted state | Test and browser interaction | Pending |

Inventory every affected category, including absence as a deliberate result:

- route paths, redirects, nested routes, query parameters, Back behavior, and
  link destinations;
- authentication, impersonation, permission filtering, disabled states, and
  unavailable actions;
- API arguments, query lifecycles, mutations, optimistic behavior, retries,
  Redux state, local or session persistence, and refresh behavior;
- translated labels, locale keys, number, date, currency, and plural formatting;
- sidebar items, product and integration marks, breadcrumbs, global and route
  controls, search placement, active state, and chrome-less routes;
- table columns, search, filters, reset, sort, initial state, pagination,
  cross-table preferences, selection, row actions, exports, and narrow layouts;
- dialog, sheet, popover, command, and menu triggers, focus, dismissal, scroll,
  nested layers, unsaved work, and action reachability;
- loading, retained refresh content, empty, no-match, partial, error, success,
  theme, reduced motion, long content, print, upload, and download states.

The ledger is a release artifact, not planning theatre. A row is complete only
when its after evidence exercises the same contract. A renamed component,
deleted import, passing typecheck, or static screenshot is not substitute
evidence.

## Fix the owning layer

Trace a mismatch upward before editing it:

1. Is the product contract wrong only for this feature? Fix the app-owned
   feature composition.
2. Does every consumer of one app composition fail? Fix that composition.
3. Does the same primitive, token, focus behavior, spacing, radius, icon, or
   responsive rule fail across apps? Fix `@guideshot/ui` or the token source.
4. Does an app render shared components differently? Inspect the CSS compiler,
   global stylesheet order, reset, theme bootstrap, and providers before adding
   overrides.

An application-local exception needs a product-specific constraint, owner, and
end condition. Visual similarity alone is not a product-specific constraint.
After a shared fix, validate at least one real consumer in every affected app;
the package example alone cannot expose application CSS or provider collisions.

## Coexistence and removal gates

Shared React providers can coexist more safely than competing global CSS and
reset systems. Establish one deliberate compiler and reset owner before broad
adoption. Do not import Tailwind 4 shared globals into a Tailwind 3 pipeline or
run two unprefixed Tailwind engines over the same document.

Move in bounded vertical slices that can be compared before and after. Keep an
old provider, stylesheet, adapter, or dependency until its measured zero-use
condition is true. Remove the compatibility layer and obsolete dependency in
the same slice that proves the replacement; do not remove it early based on an
estimated inventory.

## Statuses

- **Pilot queued**: the shared counterpart exists, but application-wide
  adoption starts in the linked pilot.
- **Legacy**: the local implementation remains in use and must not gain new
  consumers when a shared counterpart exists.
- **Needs classification**: the local name overlaps the shared system, but its
  product role must be clarified before migration.
- **Adapter**: a temporary compatibility layer is registered below.
- **Migrated**: consumers use the shared package and the local implementation
  can be removed.

## Migration register

The owner is the maintainer of the consuming application. A row stays in this
register until its local implementation and legacy imports are gone.

The historical Infood Web inventory, phase order, entry criteria, and provider
removal gates live in the
[Infood Web migration record](infood-web-migration-order.md). Future Infood Web
migration work adds dated evidence without rewriting that baseline and updates
the application profile when its current composition contract changes.

| Legacy components | Consumers | Owner | Status | Removal condition |
| --- | --- | --- | --- | --- |
No legacy generic component is currently registered. Add a row before
introducing a bounded migration adapter.

INF-503 removed the local admin sidebar implementation. The app-owned dashboard
layout now composes the shared shell and sidebar while retaining routing,
navigation data, API queries, permissions, and product copy.

INF-509 completed the remaining `infood-admin-web` adoption. The app has no
`src/components/ui` inventory or direct Radix component dependencies. Generic
controls, charts, semantic tables, and TanStack table foundations come from
`@guideshot/ui`. The app-owned `src/components/admin-data-table` composition keeps
admin filter metadata, English toolbar copy, and table state outside the shared
package while rendering the shared DataTable, header, and pagination primitives.

INF-511 completed the remaining `data-core-web` adoption. The app has no
`src/components/ui` inventory or direct Radix component dependencies. Generic
controls, charts, tables, shell, identity rows, and layout come from
`@guideshot/ui`. The app-owned `src/components/data-table` composition retains Data
Core filter metadata, custom filters, query refresh behavior, and copy while
rendering the shared table, sorting header, and pagination foundations.

The 2026-08-13 Infood Web checkpoint completed the remaining adoption. The app
has no local `components/ui`, legacy `InfoodTable`, Chakra or Mantine imports,
page-layout adapter, or compatibility-surface marker. Its app-owned
`infood-data-table` composition retains translated filters, persistence,
exports, routing, actions, and domain-specific narrow layouts while rendering
shared table foundations.

## Temporary adapters

An adapter is allowed only when a bounded migration must preserve an existing
application API. It must compose or re-export the shared primitive without
introducing a second visual contract. Before adding one, add a row with all of
these fields:

| Adapter path | Shared target | Consumers | Owner | Tracking issue | Removal condition |
| --- | --- | --- | --- | --- | --- |
No temporary UI migration adapter is currently registered.

The removal condition must be observable, such as “all consumers import
`@guideshot/ui/components/button` and the adapter has no imports.” “Remove later”
is not sufficient.

## Completion proof

Review migration completion in four independent dimensions:

| Dimension | Required evidence |
| --- | --- |
| Structural | Import inventory, provider and dependency gates, UI-boundary check, and no unregistered adapter. |
| Product contract | Completed parity ledger plus focused tests for state, precedence, mapping, and persistence behavior. |
| Interaction | Real browser evidence for triggers, keyboard and pointer paths, focus, dismissal, scrolling, transitions, and mutation settlement. |
| Presentation | Correct shared anatomy and tokens, long realistic content, light and dark themes, desktop and narrow containment, and no document overflow. |

The scope of the claim must match the scope of the evidence. A package check can
prove a package contract; one route screenshot cannot prove an app-wide
migration. If validation is explicitly deferred, keep the corresponding rows
pending and describe the work as implemented but unvalidated.

## Pull request checklist

- Classified the task as migration, rebuild, or feature change and did not mix
  those permissions implicitly.
- Captured before-state evidence and completed the behavior parity ledger for
  every affected route, workflow, and shared composition.
- Reused an existing shared primitive where one exists.
- Added application-independent UI to `packages/ui`, not an application-local
  `components/ui` folder.
- Kept product infrastructure and domain behavior in the application.
- Fixed repeated defects at their owning layer and validated shared fixes in
  every affected application.
- Updated the migration or adapter register when legacy surface area changed.
- Linked a follow-up issue for any compatibility layer that cannot be removed
  in the same pull request.
- Reported structural, product-contract, interaction, and presentation evidence
  separately without treating one as proof of the others.
