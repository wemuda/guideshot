# Canonical examples

This is a visual-evidence whitelist. Approval covers only the named decisions,
not the screen's copy, data, routing, or domain logic.

| Screen | Status | Surface | Source |
| --- | --- | --- | --- |
| Admin `/home` | Canonical | Portfolio overview | `packages/infood-admin-web/src/pages/dashboard/home/Home.tsx` |
| Data Core `/home` | Canonical | Quality overview | `packages/data-core-web/src/pages/dashboard/home/Home.tsx` |
| Admin `/settings` | Negative | Settings and operations | `packages/infood-admin-web/src/pages/settings/Settings.tsx` |

## Approved decisions

Admin `/home` demonstrates equal peer KPIs with comparison context, one
dominant operating table, a narrower evidence rail, clear page actions, compact
data density, and a readable one-column reflow.

Data Core `/home` demonstrates a defensible lead metric, aligned supporting
signals, page-wide reporting scope, explicit status and progress, named trends
and breakdowns, localized data states, and mobile reflow.

## Negative evidence

Admin `/settings` demonstrates what to avoid: weak page purpose, backend-shaped
grouping, an arbitrary card grid with unused space, switches used as selection,
competing normal and force actions, missing scope and outcome feedback,
palette-specific warnings, and clipped narrow-screen actions.

Every other Admin and Data Core screen is unclassified, and every Infood Web
screen is unclassified. Inspect it for required behavior and domain content
only. A migrated or recently polished screen is not promoted by recency. New
work may have no canonical screen match; use the principles and surface patterns
instead of inventing approval.

## Promotion rule

A new canonical entry needs explicit design-owner approval, the decisions that
may be copied, source paths, and current desktop, narrow-screen, populated, and
relevant non-populated evidence. Replace displaced precedent rather than
leaving competing references.
