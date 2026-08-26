# Core primitives

Import primitives from `@guideshot/ui`. Application code owns translated copy,
routing, permissions, server state, and domain status mapping. This document
owns APIs and implementation mechanics; the
[component dos and don'ts](component-dos-and-donts.md) own when to use them.

```tsx
import { Alert02Icon, Delete02Icon, InboxIcon } from '@hugeicons/core-free-icons'
import {
  AutoSkeleton,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  Label,
  Skeleton,
  Spinner,
  StatusBadge,
} from '@guideshot/ui'
```

## Canonical inventory

Use direct `@guideshot/ui/components/*` imports in applications. The shared package currently owns:

- actions and forms: `alert`, `alert-dialog`, `button`, `checkbox`, `date-picker`, `input`, `input-group`, `label`, `number-input`, `progress`, `radio-group`, `select`, `slider`, `switch`, and `textarea`;
- navigation and disclosure: `accordion`, `breadcrumb`, `collapsible`, `product-switcher`, `resizable`, `sidebar`, `sidebar-navigation`, and `tabs`;
- overlays: `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `hover-card`, `popover`, `sheet`, and `tooltip`;
- data and feedback: `auto-skeleton`, `avatar`, `badge`, `calendar`, `card`, `kbd`, `scroll-area`, `separator`, `skeleton`, `spinner`, `status-badge`, `table`, and `sonner`.

All primitives use the shell 1a token contract and Geist typography. Their icons use Hugeicons Free Stroke Rounded through the shared `Icon`; applications should pass icon data, not icon components.

Add a missing application-independent primitive through the shadcn CLI in `packages/ui`. Do not create a frontend-local `components/ui` copy.

## Disclosure and selection

Use `Accordion` for vertically grouped disclosure, `HoverCard` for supplementary preview content, `ContextMenu` only when the same actions remain available elsewhere, and `Slider` for bounded numeric input with a visible label and current value.

The default `TabsList` renders one bordered segmented control and one bordered
selection surface that slides between triggers. The `line` variant uses the
same shared indicator as a sliding underline. Do not add active backgrounds,
borders, or pseudo-elements to individual triggers; customize the moving
surface with `indicatorClassName` instead.

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="details">
    <AccordionTrigger>{t('details')}</AccordionTrigger>
    <AccordionContent>{details}</AccordionContent>
  </AccordionItem>
</Accordion>

<Label htmlFor="confidence">{t('confidence')}</Label>
<Slider id="confidence" value={[confidence]} onValueChange={setConfidence} />
```

- Do keep trigger and action copy application-owned and translated.
- Do provide a keyboard-reachable alternative for context-menu actions.
- Don't put required information only in a hover card or rely on slider position without a readable value.

## Button and Spinner

Use `Button` for actions and `asChild` for links that need button styling. Icon-only buttons need an accessible name. Loading buttons stay disabled, expose busy state, and retain visible text.

```tsx
<Button type="submit" disabled={isSaving} aria-busy={isSaving}>
  {isSaving && <Spinner data-icon="inline-start" />}
  {isSaving ? t('saving') : t('save')}
</Button>

<Button size="icon" variant="ghost" aria-label={t('delete')}>
  <Icon icon={Delete02Icon} />
</Button>
```

- Do use `default` for the primary action, `outline` or `secondary` for supporting actions, and `destructive` for destructive confirmation.
- Do use `Spinner label={t('loading')}` when the spinner has no adjacent accessible text.
- Don't add an `isLoading` variant or make a clickable `div` look like a button.

## Input and Label

Every visible input has an associated `Label`. Connect descriptions and validation messages with `aria-describedby`, and use `aria-invalid` for invalid values.

```tsx
<div className="grid gap-1.5">
  <Label htmlFor="email">{t('email')}</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-help"
    aria-invalid={hasError}
    disabled={isSaving}
  />
  <p id="email-help" className="text-xs text-muted-foreground">
    {hasError ? t('emailInvalid') : t('emailHelp')}
  </p>
</div>
```

- Do keep the label visible and use the placeholder only as an example.
- Don't encode validation with color alone or detach a label from its control.

## Card

Cards group related content. Use `size="sm"` for dense secondary content and the default size for primary content.

```tsx
<Card size="sm">
  <CardHeader>
    <CardTitle>{t('invoiceStatus')}</CardTitle>
    <CardDescription>{t('invoiceStatusDescription')}</CardDescription>
  </CardHeader>
  <CardContent>{children}</CardContent>
  <CardFooter>{actions}</CardFooter>
</Card>
```

- Do use one card for one coherent content group.
- Do use the shared header, title, description, content, and footer slots for
  their intended anatomy; omit an unused slot instead of recreating its spacing.
- Don't make the whole card interactive when a link or button can identify the action.
- Don't place a title directly in the card root, cancel shared padding to rebuild
  it locally, or nest another card to recover hierarchy.

## Dialog

`Dialog` delegates focus trapping, Escape handling, outside interaction, and
focus restoration to Radix. Every dialog needs a visible translated title and
close label. Add a description when its purpose or consequence is not already
clear.

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>{t('edit')}</Button>
  </DialogTrigger>
  <DialogContent closeLabel={t('close')}>
    <DialogHeader>
      <DialogTitle>{t('editOrganization')}</DialogTitle>
      <DialogDescription>{t('editOrganizationDescription')}</DialogDescription>
    </DialogHeader>
    {form}
    <DialogFooter>{actions}</DialogFooter>
  </DialogContent>
</Dialog>
```

- Do let the dialog return focus to its trigger and keep the primary action last.
- Do constrain the overlay to the viewport, keep header and footer reachable,
  and put overflow on a min-height-constrained content body.
- Use `mobileLayout="full-screen"` for dense mobile tasks, or
  `mobileLayout="below-app-header"` when the shell header must remain visible.
- Don't omit `DialogTitle`, let the document scroll to reach dialog actions, or
  use a dialog for ordinary navigation.

## Command

Use `CommandDialog` for product-wide search or a substantial expert command
surface. Use `Command` inside an anchored `Popover` for a searchable combobox or
compact picker. Compose the shared anatomy in this order: `CommandInput`,
`CommandList`, `CommandEmpty`, grouped `CommandItem` rows, optional separators,
and `CommandFooter` when shortcut help or status belongs below the list.

- Do pass translated `title` and `description` to `CommandDialog`, even when its
  accessible header is visually hidden.
- Do let `CommandList` own result scrolling and keep the footer outside it.
- Do use the shared item layout, selected state, checked indicator, shortcuts,
  keyboard navigation, and pointer behavior instead of rebuilding command rows.
- `CommandList` applies the standard vertical scroll fade to bounded results.
- Use `shouldFilter={false}` when the application already filters remote results
  and use `CommandInput isSearching` for active retrieval.
- Don't show loading, empty, and results simultaneously, place arbitrary buttons
  outside `CommandItem`, or use a command surface for a short fixed selection
  that belongs in `Select` or a radio group.

## ScrollArea

Use `ScrollArea` for an intentionally bounded region. Its viewport applies the
standard vertical scroll fade by default while the root retains borders,
backgrounds, and the visible scrollbar. Set `fade="x"` for a horizontal region
or `fade={false}` when fading would obscure fixed, sticky, or spatial content.

```tsx
<ScrollArea className="h-64 rounded-lg border">
  {items.map(item => (
    <Item key={item.id}>{item.name}</Item>
  ))}
</ScrollArea>
```

- Do keep the scroll area bounded and give keyboard users a reachable path
  through interactive content.
- Don't use it to hide page overflow, nest it without a concrete need, or fade
  canvases, PDFs, code viewers, and virtualized spatial workspaces by default.

## Sheet

`Sheet` preserves visible page context while Radix owns focus trapping, Escape
handling, outside interaction, and focus restoration. Side sheets float `8px`
inside the viewport with the overlay radius, floating shadow, and disclosure
motion. Left and right sheets default to a `30rem` maximum width; applications
can set a larger responsive `max-w-*` when the bounded task needs it.

Every sheet needs a visible translated title and close label. Keep scrolling on
the content body so its title and actions remain reachable.

Render a child sheet inside its parent `Sheet` and set `nested` when an object
inside the parent needs a second inspection layer. The parent moves back while
the child is open, and only the top sheet remains interactive. Do not use
`nested` for unrelated sheets that happen to be open at the same time.

`SheetContent` is the visual and overflow boundary. Direct layout children must
be able to shrink with `min-w-0` and `min-h-0`; keep header and footer outside
the scrolling body. Consumer backgrounds, sticky regions, and nested scrollers
must remain clipped by the shared inset and radius rather than covering its
border or corners.

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent closeLabel={t('close')}>
    <SheetHeader>
      <SheetTitle>{t('invoiceDetails')}</SheetTitle>
      <SheetDescription>{t('invoiceDetailsDescription')}</SheetDescription>
    </SheetHeader>
    {content}
    <SheetFooter>{actions}</SheetFooter>
  </SheetContent>
</Sheet>
```

```tsx
<Sheet open={listOpen} onOpenChange={setListOpen}>
  <SheetContent closeLabel={t('close')}>
    {list}
  </SheetContent>

  <Sheet nested open={detailsOpen} onOpenChange={setDetailsOpen}>
    <SheetContent closeLabel={t('close')}>
      {details}
    </SheetContent>
  </Sheet>
</Sheet>
```

## Badge and StatusBadge

Use `Badge` for compact metadata. Use `StatusBadge` only for semantic state, after mapping the domain value in the application.

```tsx
<Badge variant="secondary">{t('draft')}</Badge>
<StatusBadge tone="success">{t('active')}</StatusBadge>
<StatusBadge tone="warning">{t('needsAttention')}</StatusBadge>
```

- Do pair every status color with visible text.
- Do keep the fill a muted mix of the badge color; do not sit status on a plain surface fill.
- Don't pass API status strings directly or add domain-specific tones to the shared component.
- Don't attach click handlers to a status badge.

## Empty, error, and not-found states

Use `EmptyState` and `ErrorState` for the common title, description, icon, and action shape. Use `NotFoundState` for an unknown application route inside the shared shell. Compose the lower-level `Empty` parts when a screen needs richer media or content.

```tsx
<EmptyState
  icon={<Icon icon={InboxIcon} size={20} />}
  title={t('noInvoices')}
  description={t('noInvoicesDescription')}
  action={<Button>{t('createInvoice')}</Button>}
/>

<ErrorState
  icon={<Icon icon={Alert02Icon} size={20} />}
  title={t('invoicesFailed')}
  description={t('tryAgain')}
  action={<Button onClick={retry}>{t('retry')}</Button>}
/>

<NotFoundState
  title={t('pageNotFound')}
  description={t('pageNotFoundDescription')}
  action={
    <Button asChild>
      <Link to="/home">{t('backToHome')}</Link>
    </Button>
  }
/>
```

- Do explain what is absent or failed and provide the next useful action.
- Don't embed default English copy, raw server errors, routing, or retry logic in the shared component.

`NotFoundState` owns the shared status treatment and responsive shell layout. Applications own its copy and navigation target.

`ErrorState` uses an alert role. Avoid mounting it repeatedly while retrying; use `aria-busy` on the containing region instead.

`ErrorBoundary` catches a render error so one broken subtree cannot unmount the shell. It is mechanism only — it renders whatever `fallback({ error, reset })` returns, so the copy, the decision whether to show the error text, and any retry or reload action stay in the application. Pass `resetKey` (the route path, typically) so navigating away clears a caught error, and `onError` to report it.

```tsx
<ErrorBoundary
  resetKey={location.pathname}
  onError={(error, info) => report(error, info)}
  fallback={props => <RouteErrorFallback {...props} />}
>
  {outlet}
</ErrorBoundary>
```

- Do wrap the routed content *inside* the shell, so navigation survives the error.
- Don't put default copy or a stack trace in the shared component: an internal tool wants the trace on screen, a customer-facing app wants translated reassurance and none of it.

## Skeleton

`Skeleton` is the manual fallback for a primitive-owned loader or a structure
that `AutoSkeleton` cannot measure safely. It approximates the final layout and
remains hidden from assistive technology. The containing region communicates
loading state.

```tsx
<section aria-busy="true" aria-label={t('loadingInvoices')}>
  <Skeleton className="h-7 w-48" aria-hidden="true" />
  <Skeleton className="mt-3 h-24 w-full" aria-hidden="true" />
</section>
```

- Do match the approximate shape and number of the eventual elements.
- Do record why automatic structure measurement is unsuitable before maintaining manual skeleton markup in an application.
- Don't use a skeleton for an action with visible progress or leave it running after content loads.
- Don't build a page-specific manual skeleton when a typed fixture can render the real component through `AutoSkeleton`.

## AutoSkeleton

`AutoSkeleton` measures the rendered component structure and generates the loading shapes automatically. Applications own the query state, translated loading label, and representative fixture data. The fixture renders the real component, so layout changes do not require separate skeleton markup.

```tsx
<AutoSkeleton
  loading={isLoading}
  label={t('loadingInvoice')}
  template={<InvoiceSummary invoice={invoiceFixture} />}
>
  {invoice && <InvoiceSummary invoice={invoice} />}
</AutoSkeleton>
```

Content that can render before its data arrives does not need a template. Use `repeat` and `repeatGap` to generate repeated rows from one representative row.

```tsx
<AutoSkeleton
  loading={isLoading}
  label={t('loadingInvoices')}
  repeat={5}
  repeatGap={8}
  template={<InvoiceRow invoice={invoiceFixture} />}
>
  {invoices?.map(invoice => (
    <InvoiceRow key={invoice.id} invoice={invoice} />
  ))}
</AutoSkeleton>
```

Use the `refresh` variant only when existing data remains available during a background request. It keeps that content visible with a non-interactive loading treatment instead of replacing it with an initial-load skeleton.

```tsx
<AutoSkeleton
  loading={isFetching && Boolean(invoice)}
  label={t('refreshingInvoice')}
  variant="refresh"
>
  {invoice && <InvoiceSummary invoice={invoice} />}
</AutoSkeleton>
```

- Do place the boundary around one coherent card, list, table, or page section.
- Do use typed fixtures that render the real component when loading data is otherwise unavailable.
- Do keep stale content visible during refetches and use `Spinner` for action progress.
- Don't wrap portals, dialogs, canvases, virtualized collections, or an entire application shell without focused browser validation.
- Don't put real customer data or default English loading copy in a shared fixture.
