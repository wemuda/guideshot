# Component dos and don'ts

Use this as a lookup when choosing or reviewing components. It is deliberately
comprehensive, but it is not required front-to-back reading for every visual
change. The shorter principles and surface guide decide the page; this guide
guards component misuse inside it.

## Rule strength

- **Must:** marked explicitly. Required for semantics, accessibility, or data
  safety. Local design approval cannot waive it; changing it requires a shared
  contract decision and validation.
- **Default:** every unmarked rule, `Do`, and `Don't`. Depart only for a
  concrete task constraint, with an owner, rationale, end condition when
  temporary, and evidence across relevant states and input modes.
- **Prefer:** marked explicitly. A heuristic, not a failed review, when the
  alternative better serves the task and the reason is recorded.

A `Don't` has the same strength as its paired `Do`. Component types and
accessibility contracts remain authoritative.

## Terms and system invariants

A **scope** is a page, an independently actionable region with its own outcome,
or a temporary task surface such as a dialog. A card or visual container is not
automatically a scope.

1. **Must:** component semantics, accessible name, focus behavior, and keyboard
   behavior match the interaction.
2. **Must:** required information, status, errors, and consequences are not
   available only through color, hover, motion, or transient feedback.
3. One scope has one dominant job and action; supporting actions stay
   subordinate.
4. Do not nest cards or temporary task surfaces to manufacture hierarchy.
5. Preserve useful context and successful data through refresh and partial
   failure; disturb only the affected scope.
6. Do not repeat one action or event as competing controls or notifications.
7. When no component fits, do not synthesize a new generic interaction in an
   application. Decide whether the task needs a page, an app-owned composition,
   or a proposed shared pattern with states and accessibility defined.
8. Use a shared primitive's complete anatomy and public API before adding local
   visual classes. Do not create a look-alike or patch generic spacing, radius,
   focus, motion, or containment independently in each consumer.

## Composition and containment

### Sections and cards

| Do | Don't |
| --- | --- |
| Use normal page flow and `ContentRegion` until a visible boundary improves comprehension. | Wrap every section, form, table, or empty state in a card by default. |
| Give one card one coherent subject, task, or comparison unit. | Put unrelated controls and content in one card because space is available. |
| Separate content inside a card with headings, spacing, rows, or separators. | Put a card inside another card. Nested cards blur ownership and hierarchy. |
| **Prefer:** Keep peer cards consistent in anatomy and visual weight. | Mix clickable, static, selectable, and expandable cards in one peer group without a clear reason. |
| Keep a card static when it contains controls. Make the whole card interactive only for one clear navigation target with no nested actions. | Combine a clickable card with other targets or use a card as a dialog, popover, sheet, banner, or navigation item. |
| Use the shared flat, bordered treatment. | Add shadows, gradients, accent borders, or raw radii to manufacture hierarchy. |

### Page and region hierarchy

| Do | Don't |
| --- | --- |
| Put page-wide scope and the page's primary action in the page header. | Repeat the same primary action in the header, card header, empty state, and sticky footer. |
| Render one route title and one breadcrumb trail through the shared page and shell contracts. | Add a second title, description, breadcrumb row, or back control inside page content. |
| Put region controls beside the region they affect. | Place a table filter in the page header when it affects only that table. |
| State shared scope, period, and purpose once; let each region add only the context unique to it. | Repeat the page header, reporting period, or explanatory sentence in every child region. |
| Show contextual page actions only in the active view where they apply. | Keep an inapplicable action visible on every tab or duplicate it inside the affected region. |
| Follow the user's reading and decision order. | Mirror API objects, services, or database tables as visual sections. |
| **Prefer:** Use whitespace and alignment before another container. | Add borders or tinted backgrounds around every grouping. |

## Overlays and temporary layers

Choose the least disruptive surface that fits the task.

| Need | Use |
| --- | --- |
| A brief decision that blocks continuation | Alert dialog |
| A short, bounded task that must hold focus | Dialog |
| Secondary inspection or editing while page context remains visible | Sheet or drawer |
| Small interactive content anchored to a trigger | Popover |
| Non-essential explanation of one control | Tooltip |
| A compact list of contextual actions | Dropdown or context menu |
| Long, multi-step, linkable, or table-heavy work | A page or in-page workspace |

### Dialogs and alert dialogs

| Do | Don't |
| --- | --- |
| Use a dialog for a short, focused, infrequent task that must interrupt the page. | Use a dialog for ordinary navigation, reading, dashboards, large tables, or multi-step work. |
| **Must:** Show a visible title, close or cancel path, and task-specific actions; state a non-obvious purpose. | Omit the title or dismissal path, or use vague actions such as `Confirm`, `Yes`, `OK`, or `Submit`. |
| **Must:** Move focus inside, contain the tab sequence, support Escape, and restore focus logically. | Mark a layer modal while background content remains operable. |
| Put scroll on the body while keeping title and actions reachable. | Let the dialog exceed the viewport or hide its actions below an unreachable scroll area. |
| Use an alert dialog for an irreversible or high-impact final decision. | Ask for confirmation on routine, reversible actions; confirmation fatigue removes its value. |
| Name the object, scope, consequence, and recovery in destructive confirmation. | Ask only “Are you sure?” or rely on red styling to explain risk. |
| Default initial focus to the least destructive action when recovery is difficult. | Auto-focus the destructive action for speed. |

The only tolerated second modal task is a brief alert dialog required to
confirm an irreversible action from a sheet or dialog. It must close back to
the invoking control and must not start another workflow. Menus, selects, date
pickers, and tooltips needed to operate the current task are not second tasks.

### Sheets and drawers

| Do | Don't |
| --- | --- |
| Use a sheet to inspect or edit a secondary object while retaining visible page context. | Move the page's primary job into a sheet to avoid designing a real page. |
| Use a drawer when its edge or bottom placement materially improves narrow-screen ergonomics. | Choose a drawer merely because the page has run out of room. |
| Keep the task bounded, title it, and keep close, cancel, and commit actions reachable. | Put an unstructured dump of fields, logs, filters, and actions in one panel. |
| Keep header and footer fixed to the shared anatomy, put scrolling on the min-height-constrained body, and contain child surfaces inside the sheet radius. | Let content, sticky children, or nested scrollers escape the inset, clip the border, hide actions, or make the document scroll to operate the sheet. |
| Treat a modal sheet's background as visible context, not interactive context. | Require users to operate the obscured page while a modal sheet is open. |
| Preserve unsaved work or warn before discarding it. | Close on incidental outside interaction when data would be lost. |
| Show applied-filter count and clear action when filters live in a closed sheet. | Make users reopen a sheet just to discover or clear active filters. |

### Popovers, hover cards, and tooltips

| Do | Don't |
| --- | --- |
| Use a popover for a small, anchored set of supplemental controls or details. | Put a long form, large table, deep navigation, or horizontal scrolling in a popover. |
| **Prefer:** Keep only one popover open. | Nest popovers or open one from inside another. |
| **Must:** Return focus logically when a popover closes. | Drop focus to the document or move it unpredictably. |
| Use a hover card only for optional preview content also available at the destination. | Put required instructions, permissions, status, or actions only in a hover card. |
| **Must:** Keep tooltip content non-essential and non-interactive. | Put links, buttons, validation, or critical instructions in a tooltip. |
| **Must:** Make hover content available on keyboard focus and dismissible without losing context. | Make hover the only way to discover information. |
| Keep trigger labels meaningful without the tooltip. | Use a tooltip to repair an ambiguous icon or cryptic control that should have visible text. |

### Menus and command surfaces

| Do | Don't |
| --- | --- |
| Use a menu for contextual actions that apply to the trigger or selected object. | Use an action menu as a select, filter form, or container for complex inputs. |
| Keep the common primary action visible and put secondary actions in the menu. | Hide every action behind an overflow icon. |
| Size the floating surface for readable item labels within the viewport and keep ordinary action labels on one line when practical. | Inherit an arbitrarily narrow trigger width that wraps every menu item or let the menu overflow the viewport. |
| **Prefer:** Use a conventional icon-only overflow trigger with an accessible object-specific name for a compact row or card menu. | Use a generic `Actions` text button when the established overflow affordance is clear, or omit its accessible name. |
| Order by frequency and workflow; separate destructive actions. | Sort actions alphabetically when that breaks the task order. |
| **Prefer:** Use at most one submenu level and as few items as practical. | Build cascading menu trees or overload one menu with unrelated commands. |
| **Must:** Keep context-menu actions reachable through a visible or keyboard path elsewhere. | Make right-click the only way to perform an action. |
| Use a command palette for fast cross-product search or expert commands. | Use a command palette instead of clear navigation or for a short fixed choice. |

#### Action availability

| State | Do | Don't |
| --- | --- | --- |
| Inapplicable | Hide the action when it cannot apply to the current object or state. | Show a disabled action that can never become valid in this context. |
| Not authorized | Keep the capability discoverable only when knowing it exists is useful; explain the requirement and provide a request-access path when one exists. | Pretend the action is available, or hide a capability users are expected to request. |
| Temporarily unavailable | Keep the action visible but disabled and state the condition that will enable it nearby. | Hide an action during loading or put its only explanation in an inaccessible tooltip. |

## Navigation and disclosure

### Tabs

| Do | Don't |
| --- | --- |
| Use tabs for peer views of the same object or scope, with one panel visible at a time. | Use tabs for global navigation, sequential steps, unrelated destinations, or a toolbar filter that does not create a distinct view. |
| Keep a view switch only when every option produces a meaningful, accurate representation. | Add no-op options or client-side aggregation controls that merely reduce fidelity. |
| **Prefer:** Put the most useful panel first, keep labels short, and avoid disabled or wrapped tabs. | Add tabs that cannot be selected or labels that no longer scan as one set. |
| **Must:** Give every tab an accessible name. | Ship an unlabeled icon-only tab. |
| Preserve the active tab in the URL when users need linking, refresh, or Back behavior. | Make route-like tabs lose state or break browser history. |
| Keep content visible together when users need side-by-side comparison. | Hide comparison targets behind separate tabs. |
| Use manual activation when loading a panel has noticeable latency. | Trigger slow requests merely by arrowing through automatically activated tabs. |

### Accordions and collapsibles

| Do | Don't |
| --- | --- |
| Use an accordion for multiple related, optional sections when users benefit from an overview and selective reveal. | Hide content that everyone must read or that determines the primary action. |
| Test clear headings and one-page structure before adding disclosure. | Use disclosure to compensate for excessive, poorly structured content. |
| Use a collapsible for one localized optional region. | Use many unrelated collapsibles when an accordion, page outline, or separate pages are clearer. |
| Keep the trigger a real heading or clearly named button with visible expanded state. | Put the only section label inside collapsed content. |
| Keep form questions and process steps visible in their intended order. | Split a form or sequential workflow across accordions. |
| Use one disclosure model in a region. | Nest accordions or mix accordions, tabs, and details inside one another. |

### Links, breadcrumbs, and side navigation

| Do | Don't |
| --- | --- |
| **Must:** Use a link for navigation and a button for an in-place action. | Style a `div` as either or make a link submit data. |
| **Must:** Write link text that identifies its destination in context. | Repeat vague links such as `Read more`, `Open`, or `Click here`. |
| Use breadcrumbs for hierarchical location. | Use breadcrumbs as browser history, progress steps, tags, or page actions. |
| Keep side navigation stable and organized by user concepts. | Mirror backend modules, exceed the supported depth, or put page actions in navigation. |

## Actions and selection controls

### Buttons

| Do | Don't |
| --- | --- |
| Start labels with a specific verb and name the result: `Refresh selected caches`. | Use generic labels when the consequence can be named. |
| Use one `default` primary button per scope and make simultaneous supporting actions `outline`, `secondary`, or `ghost` according to hierarchy. | Put two equally prominent primary actions beside each other. |
| Reserve destructive styling for the final destructive action. | Make the initial path to a confirmation destructive too. |
| **Must:** Give a loading button an accessible busy state and prevent duplicate submission. | Replace its accessible name with an unlabeled spinner. |
| Keep a loading button's visible label and width stable. | Make the action jump or become unrecognizable while loading. |
| **Must:** Give every icon-only button an accessible name. | Ship an icon-only control without a programmatic label. |
| Give icon-only buttons a tooltip; use visible text when the icon is ambiguous or the action is primary. | Use a tooltip to justify an icon that users cannot reasonably recognize. |
| **Prefer:** Use a toolbar for three or more related controls and order them by importance. | Build a toolbar for one or two controls or scatter one control set across the page. |

### Choose the semantic control

**Must:** choose the control by its behavior and value model, not by its
appearance.

| Control | Do | Don't |
| --- | --- | --- |
| Switch | Use for one binary setting that applies immediately; keep its label stable. | Use for selecting work for a later command, destructive effects, or more than two states. |
| Checkbox | Use for independent choices, multi-selection, or targets processed by a later action. | Use when exactly one option must be chosen. |
| Radio group | Use for one choice among a small visible set where comparison matters. | Hide a short two- or three-option choice in a select. |
| Select | Use for one choice from a longer, familiar, non-searchable list. | Use as the first solution when options can be reduced or shown as radios. |
| Combobox | Use for a long, searchable, remote, or creatable option set. | Use when all choices should be visible or when free text is not valid. |
| Slider | Use for an approximate value within a bounded range and show the value. | Use for an exact, high-risk, or unbounded value without a precise input alternative. |
| Date picker | Use when calendar context helps choose a date. | Force calendar navigation when users can type a known date faster. |

A `DropdownMenu` is an action surface, not a synonym for `Select` or
`Combobox`.

Keep selected and unselected options identical in font size, weight, padding,
and measured dimensions. Express selection through the shared indicator,
border, and color. Keep short peer labels on one line; stack the options at a
narrow boundary instead of wrapping one label or squeezing unequal controls.

## Forms and settings

| Do | Don't |
| --- | --- |
| Ask only for information required for the current job. | Expose fields because the API happens to accept them. |
| Group fields by user concept with visible section headings. | Group by service, DTO, database table, or save endpoint. |
| **Must:** Give every field a visible label. | Use a placeholder as the label. |
| Keep non-obvious format, scope, default, or consequence in persistent helper text. | Hide essential help in a tooltip. |
| Mark optional fields consistently and explain non-obvious requirements before entry. | Reveal requirements only after submission. |
| Use focused content width and a logical keyboard and reading order. | Stretch short fields edge-to-edge or create multi-column forms that collapse ambiguously. |
| State whether settings save immediately or on commit and show the resulting state. | Mix immediate switches and staged fields without explaining save behavior. |
| Preserve entered values after validation fails. | Clear the form, reset selection, or make users repeat valid input. |
| On a page-length or multi-section form, show a concise error summary plus specific inline messages linked to fields. In a short dialog, focus the first invalid field and show inline errors. | Show only a toast, generic `Invalid value`, raw server error, or color-only border. |
| Tell users what failed and how to fix it. | Blame users, joke about errors, or repeat the field label as the error. |
| Validate while typing only when evidence shows it helps and after the value can be judged. | Interrupt unfinished entry or run conflicting client and server rules. |
| Warn before discarding meaningful unsaved work. | Block navigation for unchanged or trivially recoverable input. |
| Use static text or a semantic readonly field when users need to inspect or copy immutable data. Use disabled only when a control is genuinely unavailable. | Disable an editable-looking field merely to display a fixed value or rely on disabled styling to explain why it cannot change. |

Use readonly only where the native control supports it. For selects, switches,
and other controls without readonly semantics, render a clear static value.

## Data, tables, and visualisation

### Choose the display

| Need | Use | Don't |
| --- | --- | --- |
| Compare records across consistent fields | Table | Turn each row into a card grid. |
| Scan a simple sequence with one main label | List | Add columns that do not support comparison. |
| Understand one object's facts | Key-value or summary list | Use a two-column data table as a detail layout. |
| Present independent, digestible objects | Cards | Use cards for dense cross-record comparison. |
| Show change, distribution, or relationship | Chart | Chart a single number or decorate a dashboard. |

### Tables, search, and filters

| Do | Don't |
| --- | --- |
| **Must:** Give the table an accessible name and make headers, units, sort state, and row identity clear. | Depend on visual alignment or icon-only headers to explain meaning. |
| Compose the shared `DataTable` when records have consistent comparable fields, sorting, pagination, or row actions. | Hand-build a visual row list that recreates table semantics and behavior. |
| Keep row actions in the row and batch actions near selected-row state. | Put row-specific actions in the page header or show batch actions with no selection. |
| **Must:** Make the row destination a real link or button even when row click is supported. | Make pointer-only row click the sole interaction. |
| Use a table for operational comparison, not spreadsheet simulation. | Add inline editing, nested tables, and arbitrary widgets until the table behaves like a spreadsheet. |
| Keep table tools together: search, filters, display controls, and table-wide action. | Scatter controls above cards or in unrelated page regions. |
| Use the shared filter picker so inactive filters stay behind `Add filter`, active filters remain visible, a newly added filter opens, and reset clears every filtering input its label promises. | Render every possible filter as a wrapping toolbar, lose focus between picker and filter, or leave global search populated after `Reset filters`. |
| Adapt toolbar and pagination density with the table container and show export only when the consumer supplies an applicable export contract. | Use viewport breakpoints for an embedded table or show export automatically where no table toolbar or product workflow calls for it. |
| Treat search as text retrieval and filters as structured criteria. | Use a search field for every kind of filtering or label a filter field `Search`. |
| Show active filters, result count when useful, and a clear-all path. | Hide applied criteria inside a closed popover or sheet. |
| Distinguish no data, no matching results, loading, permission, and failure. | Reuse the same blank table message for every state. |
| Keep sorting and pagination stable across refreshes unless the data invalidates them. | Reset users to page one or default sort on every background request. |
| Contain necessary two-dimensional table scrolling. | Cause page-level horizontal scrolling or silently clip columns. |

### Metrics, charts, and status

| Do | Don't |
| --- | --- |
| Give metrics the unit, scope, period, and relevant comparison or target. | Show an unexplained large number. |
| **Must:** Give each chart an accessible name or summary. | Leave its purpose and values available only visually. |
| Make each chart answer a named question. | Use chart type, color, animation, or 3D effects as decoration. |
| Use consistent encodings and the shared palette; label important values directly when practical. | Reassign the same color to different meanings nearby or require hover to read the result. |
| Limit series and categories to what users can distinguish and act on. | Use a pie or legend-heavy chart for many similar categories. |
| **Must:** Give semantic state visible text. | Communicate status with color alone. |
| Use `StatusBadge` after app-owned mapping. | Make it clickable or pass raw API values directly. |

### Supporting display primitives

| Primitive | Do | Don't |
| --- | --- | --- |
| Avatar | Use as supporting identity with a useful name or accessible label and a stable fallback. | Make a photo, color, or initials the only way to identify a person or organization. |
| Badge | Use for short, non-interactive metadata. | Put sentences, actions, editable state, or raw API values in a badge. |
| Separator | Use sparingly when spacing alone does not make grouping clear. | Draw a line between every item or use separators instead of headings and structure. |
| Scroll area | Use for one intentionally bounded region such as a long menu or inspector. | Nest scroll areas, hide page overflow, or create scroll traps to make a layout fit. |
| Keyboard hint | Use `Kbd` only for a real, working shortcut. | Decorate actions with shortcuts that are unavailable or undiscoverable. |
| Input adornment | Use a prefix, suffix, or inline action only when its relationship to the field is clear and accessible. | Let an icon replace the field label or place several unrelated actions inside an input. |

## Feedback, loading, and system state

### Choose the message surface

| Scope and persistence | Use | Don't |
| --- | --- | --- |
| One field | Inline validation | Use a toast. |
| One section or recoverable regional failure | Inline alert or error state | Replace the whole page. |
| Page-wide or system-wide ongoing issue | Banner | Show several banners or use one for trivial success. |
| Brief acknowledgement with no required follow-up | Toast | Use as the only record of a long-running, destructive, partial, or failed operation. |
| No content yet | Empty state with explanation and next action | Present a blank card or disabled table. |
| Critical decision requiring immediate action | Alert dialog | Interrupt users for passive information. |

Keep one notification of a given event. A toast plus banner plus inline success
message for the same save is noise, not reassurance.

### Loading, refresh, progress, and results

| Do | Don't |
| --- | --- |
| Default to shared `AutoSkeleton` with a typed fixture of the real component for initial card, list, or section loading; use primitive-owned table loading or a documented manual fallback only when structure cannot be measured. | Hand-maintain a second skeleton layout that drifts from the rendered component, or skeletonize buttons, menus, dialogs, and toasts. |
| Keep useful content visible and mark its region busy during background refresh. | Replace stable content with a full skeleton or page spinner on every refetch. |
| Use an inline spinner for a short local action and keep its label. | Block the entire page for one card or button request. |
| Keep pending feedback inside an existing fixed-size affordance when the object remains in place. | Add a temporary row, label, or padding that resizes or repositions the object until the response arrives. |
| Use determinate progress when completion can be measured; otherwise name the running operation. | Display fake percentages or an indefinite spinner for a long operation with known progress. |
| State whether users can navigate away and whether work continues. | Trap users on an operation page without explaining lifecycle. |
| On completion, show what succeeded, failed, was skipped, and what can be retried. | Announce success before the server commits or collapse partial failure into `Done`. |
| Preserve successful data when another region fails. | Turn a partial failure into a total-page error. |
| **Must:** Announce loading, errors, and results to assistive technology without repeated chatter. | Mount repeated alerts during polling or move focus on every update. |

## Responsive, input, and accessibility guardrails

| Do | Don't |
| --- | --- |
| Validate the practical product layout at desktop and 390px with long realistic content. | Treat a squeezed desktop layout as mobile design. |
| Use container queries when a component's available width depends on its parent, such as embedded tables, split panes, cards, and toolbars. | Use only viewport queries for a component that can be narrow on a wide screen. |
| **Must:** Validate affected reflow at 320 CSS pixels or equivalent zoom without loss of information or function. Contain genuine two-dimensional data. | Treat a passing 390px layout as proof of WCAG reflow or allow page-level two-dimensional scrolling. |
| **Must:** Preserve semantic order while stacking regions and actions. | Reorder visually in a way that breaks reading or keyboard order. |
| **Must:** Keep required text and actions visible; use explicit overflow for genuine two-dimensional data. | Clip, truncate, or hide primary information to make a layout fit. |
| **Must:** Keep shared control sizes; meet WCAG's 24 by 24 CSS pixel minimum or required spacing. | Shrink icon buttons and row actions until they are hard to target. |
| **Must:** Keep focus visible and unobscured by sticky headers, footers, sheets, and toasts. | Cover the focused control or its action area with persistent layers. |
| **Must:** Support keyboard, pointer, and touch without hover-only or right-click-only behavior. | Make drag, hover, swipe, or precise pointer movement the only path. |
| **Must:** Pair color with text, shape, icon, pattern, or position. | Use color alone for status, selection, error, chart meaning, or action severity. |
| **Must:** Respect reduced motion and keep state changes understandable without animation. | Use motion as the only sign that content changed. |
| Let labels, values, and actions grow for translation and zoom. | Fix widths around current English copy or encode text into images and icons. |
| **Must:** Use native semantics and shared primitives before custom ARIA. | Recreate buttons, dialogs, tabs, selects, or tables with generic elements. |

## Content guardrails

| Do | Don't |
| --- | --- |
| Name the page after the user's object or job. | Use internal service names or vague titles such as `Management`. |
| Put the important noun in control labels: `Delete supplier`, `Retry import`. | Use `Delete`, `Retry`, or `Open` when several targets are present. |
| Write errors as a specific problem plus a recovery path. | Show exception names, status codes, stack traces, or `Something went wrong` alone. |
| Use concise sentence case and consistent domain terms. | Use all caps, decorative punctuation, or several names for one concept. |

## Research basis

These external sources informed the rules; the local Infood decisions above are
normative:

- W3C: [ARIA patterns](https://www.w3.org/WAI/ARIA/apg/patterns/),
  [modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
  [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/),
  [accessible names](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/),
  [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
  [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum),
  [focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible),
  [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum),
  and [use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color).
- GOV.UK Design System: [accordion](https://design-system.service.gov.uk/components/accordion/),
  [tabs](https://design-system.service.gov.uk/components/tabs/),
  [buttons](https://design-system.service.gov.uk/components/button/),
  [select](https://design-system.service.gov.uk/components/select/),
  [error messages](https://design-system.service.gov.uk/components/error-message/),
  [error summary](https://design-system.service.gov.uk/components/error-summary/),
  and [notification banners](https://design-system.service.gov.uk/components/notification-banner/).
- Carbon Design System: [tiles](https://carbondesignsystem.com/components/tile/usage/),
  [menus](https://carbondesignsystem.com/components/menu/usage/),
  [popovers](https://carbondesignsystem.com/components/popover/usage/),
  [tooltips](https://carbondesignsystem.com/components/tooltip/usage/),
  [dropdowns](https://carbondesignsystem.com/components/dropdown/usage/),
  [forms](https://carbondesignsystem.com/patterns/forms-pattern/),
  [data tables](https://carbondesignsystem.com/components/data-table/usage/),
  [filtering](https://carbondesignsystem.com/patterns/filtering/),
  [loading](https://carbondesignsystem.com/patterns/loading-pattern/), and
  [notifications](https://carbondesignsystem.com/components/notification/usage/).
- ActiveCampaign Design Guide: [card composition](https://www.activecampaign.design/docs/components/card/camp-1).
