# Agent UI workflow

Use this workflow for visual frontend implementation and review. A new screen
or substantial recomposition uses the full brief below. A design-system
migration also reads [migration governance](migration-governance.md) first and
completes its behavior parity ledger. The permission below to replace weak
hierarchy or redundant controls applies to an explicit rebuild, not to a
migration-only task.

## 1. Brief

Record:

```md
Task mode: migration | rebuild | feature change
User job:
Surface type:
Required behavior and data:
Frozen application contracts:
Information order:
Primary action:
States:
Transient behavior from interaction through server settlement:
Narrow behavior at 390px:
Affected reflow at 320px:
Canonical evidence or none:
Unknown product decisions:
```

`none` is valid canonical evidence. Never force an unrelated Home pattern.

## 2. Inspect

- Open the current route at desktop and 390px when it exists. Check 320px when
  the change affects a shared primitive, shell, layout, or reflow.
- Use the current screen to learn behavior; use only canonical screens for
  visual precedent.
- Inspect the relevant shared components before adding markup or styles.
- Inspect sibling consumers and the target app root when a visual mismatch may
  come from a shared primitive, token, compiler, reset, theme, or provider.
- Identify routing, permissions, queries, copy, and domain mapping that must
  remain application-owned.
- Identify duplicated headings, scope, periods, actions, and controls that do
  not produce a distinct useful result. These are replacement candidates, not
  contracts to preserve.

Ask the user only when navigation, action priority, status meaning, or the
scope and reversibility of high-impact work cannot be established safely.

## 3. Implement

Reuse `@guideshot/ui`, semantic tokens, and the shared `Icon`. Preserve behavior
unless the task changes it. Keep feature composition and product meaning in the
application.

Use the shared component's complete anatomy and public API before adding local
classes. When the same defect appears more than once, stop and fix the owning
shared or app-composition layer. A route-local override is valid only for a
route-specific product constraint, not to make a generic primitive resemble
its peers.

## 4. Review gates

Rule strength follows the
[component dos and don'ts](component-dos-and-donts.md).

The change is not ready until all relevant gates pass:

- The user job and reading order are obvious.
- Action hierarchy and control semantics match their consequences.
- Scope, periods, descriptions, and actions are stated once at the highest
  level where they apply; no control is a no-op or degrades data fidelity.
- Populated and applicable loading, refresh, empty, partial, error, disabled,
  running, and success states are intentional.
- Initial loading uses the shared automatic skeleton contract unless a manual
  exception is recorded; refresh and mutation feedback preserve useful
  content.
- Selection, loading, action-set changes, optimistic updates, and server
  settlement do not resize or animate unchanged controls and objects.
- Real interactions are exercised through their actual pointer, touch, and
  keyboard paths where applicable. For drag and drop, test empty and occupied
  destinations and compare the in-flight placeholder, first dropped frame,
  and settled result rather than validating only a fallback menu.
- Desktop and 390px have no clipped required content or page overflow.
- At 320px, affected content loses no information or function; genuine
  two-dimensional data scrolls inside its own container.
- Keyboard focus, accessible names, non-color status, and reduced motion are
  preserved.
- Every **Must** rule passes. A **Default** departure records its constraint,
  owner, rationale, and evidence. A **Prefer** departure records only why the
  alternative serves the task better.
- No unclassified screen, raw visual value, or application-owned behavior was
  promoted into shared ground truth.
- Browser evidence and checks are reported accurately.
- For migrations, every parity-ledger row has before and after evidence; import
  counts and typechecks are reported as structural evidence only.
- A shared or token-level fix is exercised in at least one real consumer in
  every affected app, including its root CSS, provider, and theme context.
- Container-owned compositions such as tables, split panes, and embedded
  toolbars adapt to their container width rather than assuming viewport width.

Run the checks that match the change:

```bash
pnpm check:design-system
pnpm check:ui-boundaries
pnpm --filter @guideshot/ui typecheck
pnpm --filter ./packages/<target-app> typecheck
```

If review exposes a missing rule, update its owning document rather than adding
the same guidance to several files.
