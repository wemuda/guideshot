# Agent design entrypoint

Read this before visual frontend work. Existing UI is not design authority just
because it is recent, shipped, or built with shared components.

## Decision order

1. The explicit user goal and required product behavior
2. Executable contracts: `src/styles/globals.css`, `@guideshot/ui`, and component
   types
3. The [design principles](design-principles.md) and
   [surface patterns](patterns/surfaces.md)
4. The [canonical register](canonical-examples.md) and target app profile
5. Unclassified screens, which may explain behavior but not presentation

Follow the higher source when they conflict. Ask the product or design owner
when the conflict changes navigation, action priority, domain meaning, or the
consequence of an operation.

## Choose the task mode first

- **Migration:** replace implementation mechanics while preserving the current
  application contract. Read [migration governance](migration-governance.md)
  and record a behavior parity ledger before editing.
- **Rebuild:** preserve product and data contracts while deliberately
  recomposing presentation from first principles. Use `$rebuild-infood-page`.
- **Feature or behavior change:** change only the behavior named by the request;
  record the old and new contract explicitly.

Migration is not redesign. Do not remove, relocate, merge, or invent product
behavior during a primitive, shell, CSS, provider, or visual-system migration
unless the task explicitly authorizes that change.

## Evidence labels

- **Canonical:** approved only for the decisions named in the register.
- **Unclassified:** preserve required behavior; do not copy its presentation.
- **Negative:** evidence of what to avoid; never use it as a visual reference.

An exception is not a fourth label. It needs a concrete constraint, an owner,
and an end condition.

## Read only what the task needs

| Task | Required source |
| --- | --- |
| Any visual change | This file, the principles, and the target app profile |
| New or substantially recomposed screen | Surface patterns and canonical register |
| Choosing or composing components | [Component dos and don'ts](component-dos-and-donts.md) and [core primitives](core-primitives.md) |
| Tokens, components, or icons | [Design tokens](design-tokens.md), [core primitives](core-primitives.md), and [iconography](iconography.md) |
| Tables or charts | [Data display](data-display.md) |
| Shell or navigation | [Shell and layout](shell-layout.md) |
| Ownership or migration | [Migration governance](migration-governance.md), the target app profile, and any app-specific migration record |
| Implementation or review | [Agent workflow](agent-workflow.md) |

App profiles:

- GuideShot site: `apps/site/docs/ui-profile.md`

## Before code

Record a brief with: user job, surface type, required behavior, information
order, primary action, states, narrow behavior at 390px, affected reflow at
320px, and canonical evidence or `none`. A missing screen precedent is not a
blocker and must not force a page into a Home dashboard pattern.

For migration work, the brief is not enough. Add the behavior parity ledger
required by migration governance and capture before-state evidence for every
affected contract before replacing its implementation.

## Maintain the ground truth

Update the one document that owns a changed decision. Promote a screen only
with explicit approval and current desktop, narrow-screen, and state evidence.
Add automated checks only for rules that can be detected mechanically.
