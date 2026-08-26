# GuideShot design principles

These six rules govern composition and interaction. Component mechanics belong
in the linked technical guides, not here.

## 1. Design for one user job

State what the user must understand or complete, then order the page around
that decision. Use a specific title, explain non-obvious scope, and write in
product language rather than backend structure.

Avoid pages that open with unrelated controls or mirror service boundaries.
The job and current scope should be clear before a card is opened.

## 2. Establish hierarchy before decoration

Use placement, size, grouping, and whitespace to show reading order. Give each
task one dominant action; keep scope and supporting actions subordinate.

Avoid equal emphasis for unequal content, decorative card nesting, gradients,
heavy shadows, and color used to rescue weak structure. The hierarchy should
remain obvious without icons or color.

## 3. Make density scannable

Operational screens may be dense when repeated content aligns and related
information stays together. Use tables for row comparison, cards for coherent
subjects, tabular numbers, and compact supporting text.

Avoid card grids with unused cells, oversized headings, ornamental whitespace,
or unrelated tasks compressed into one surface. Dense is useful; cramped and
arbitrary are not.

## 4. Make controls reveal consequence

Use the control that matches the behavior: switches apply an immediate binary
state, checkboxes select targets for a later command, tabs switch peer views,
buttons act, and links navigate.

Separate normal, destructive, force, reset, and broad-scope actions. Explain
scope and consequence before high-impact work and confirm it when recovery is
not immediate. Never rely on color alone to communicate state or severity.

## 5. Make data and system state self-explanatory

Metrics need the relevant unit, scope, period, denominator, comparison, target,
or status. Charts must answer a named question rather than decorate a page.

Design populated, initial loading, background refresh, empty, partial, error,
disabled, running, and success states as applicable. Disturb only the blocked
scope: preserve useful data through refresh and partial failure, place recovery
where failure occurred, and keep consequential results available beyond a
toast.

## 6. Reflow without losing the task

At narrow widths, preserve title, scope, primary action, and evidence order by
changing the composition. Stack before cards become cramped and choose an
explicit mobile treatment for wide data.

At 390px, the practical product layout must keep required actions and text
reachable. At the 320 CSS pixel reflow boundary, information and function must
remain available without page-level two-dimensional scrolling; contain wide
data that genuinely needs two axes. Keyboard focus, accessible names, status
text, and reduced motion remain part of the design.

## Implementation boundary

`@guideshot/ui` owns tokens, reusable visual behavior, and accessibility
contracts. Applications own routing, permissions, queries, translated copy,
domain mapping, and workflows. Reuse shared primitives without moving product
meaning into the shared package.
