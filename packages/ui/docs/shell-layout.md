# Shell and layout primitives

Import shell primitives from `@guideshot/ui`. Applications own navigation data, active-route matching, routing, permissions, persistence, queries, and translated copy.

## Application shell

`AppShell` provides responsive sidebar state and tooltip behavior. Compose `Sidebar` and `AppShellMain` as siblings so the sidebar can reserve desktop space without coupling the package to a router.

`Sidebar` defaults to `collapsible="icon"`, matching the current Infood expanded and compact navigation model.

```tsx
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderStart,
  AppShell,
  AppShellMain,
  Icon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarCollapseButton,
  SidebarHeader,
  SidebarMenuIdentity,
  SidebarNavigation,
  SidebarRail,
  SidebarSearchButton,
  SidebarTrigger,
  useSidebar,
} from '@guideshot/ui'

function ApplicationLayout() {
  const { pathname } = useLocation()

  return (
    <AppShell
      labels={{
        toggle: t('navigation.toggle'),
        overlayTitle: t('navigation.title'),
        overlayDescription: t('navigation.description'),
      }}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          {workspaceSelector}
          <SidebarSearchButton
            label={t('search.quickSearch')}
            onClick={openGlobalSearch}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation
            label={t('navigation.procurement')}
            labels={{
              collapseGroup: label => t('navigation.collapseGroup', { label }),
              expandGroup: label => t('navigation.expandGroup', { label }),
              overview: t('navigation.overview'),
            }}
            items={navigationItems}
            renderLink={(item, children, onNavigate) => (
              <Link to={item.href ?? '#'} onClick={onNavigate}>{children}</Link>
            )}
          />
        </SidebarContent>
        <SidebarFooter>{accountMenu}</SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <AppShellMain>
        <AppHeader>
          <AppHeaderStart>
            <SidebarTrigger />
            <SidebarCollapseButton />
            {moduleSelector}
          </AppHeaderStart>
          <AppHeaderActions>{globalActions}</AppHeaderActions>
        </AppHeader>
        <Outlet />
      </AppShellMain>
    </AppShell>
  )
}
```

- Do filter navigation by permissions in the application before rendering it.
- Do calculate `isActive` with the application router and pass translated labels to the shell.
- Do use `SidebarMenuButton asChild` for links and real buttons for actions.
- Don't import React Router, Redux, API clients, authentication, or domain configuration into `@guideshot/ui`.
- Don't pass API permission or status values into the shared layout.

## Sidebar identity rows

Use `SidebarMenuIdentity` for the product switcher and account menu triggers.
It standardizes the leading logo or avatar, title and description typography,
trailing affordance, open state, and collapsed sizing across applications.
Applications supply only their logo or avatar, copy, and menu behavior.

```tsx
<DropdownMenuTrigger asChild>
  <SidebarMenuIdentity
    leading={<img src={logo} alt="" />}
    leadingVariant="brand"
    label={t('productName')}
    description={t('workspaceName')}
    trailing={<Icon icon={ArrowDown01Icon} />}
  />
</DropdownMenuTrigger>
```

- Do use the same identity row for admin and Data Core sidebar headers and account menus.
- Don't recreate its spacing, typography, collapse behavior, or open-state styling in an application.

Use `ProductSwitcher` inside the header identity dropdown. It renders the
available products as one keyboard-navigable tab list with large square icons,
consistent active styling, and a three-column layout. Applications supply the
active product, product copy, icon data, and environment-resolved destinations,
then navigate from `onValueChange`. The callback runs after the active-state
transition so users see their selection before cross-application navigation.

```tsx
<ProductSwitcher
  value="admin"
  items={products}
  onValueChange={value => navigateToProduct(value)}
/>
```

- Do use the shared switcher in Admin and Data Core so pointer and keyboard behavior stay aligned.
- Do keep deployment URLs and cross-application navigation in the consuming application.
- Don't place application routing or environment configuration in `@guideshot/ui`.

## Responsive behavior

| Viewport | Sidebar behavior | Main content |
| --- | --- | --- |
| Desktop, `1024px` and wider | Persistent sidebar. `collapsible="icon"` switches between `244px` expanded and a `66px` icon rail over 180ms. | Reflows beside the sidebar. |
| Tablet, `768px–1023px` | Modal sheet up to `288px` wide. It opens from `SidebarTrigger`; backdrop interaction and Escape close it. | Remains full width behind the overlay. |
| Mobile, below `768px` | The same modal sheet, capped to the viewport with a `2rem` edge allowance. | Remains full width behind the overlay. |

`SidebarTrigger` is visible for tablet and mobile overlays. `SidebarCollapseButton` is the desktop double-chevron control in the application header before the breadcrumbs. The shell exposes `viewport`, `isMobile`, `isTablet`, and `isOverlay` through `useSidebar` when an application needs to close the overlay after navigation.

`SidebarSearchButton` is the shared search surface directly below the product identity. It keeps the expanded search field, collapsed search icon, shortcut hints, tooltip, and focus treatment identical across applications. Applications own the dialog, queries, result rendering, and navigation behind it.

`SidebarNavigation` owns the two-level tree, shared active fill, disclosure motion, optional icons on parent and child rows, and the collapsed flyout. In the expanded state the root label and icon are a link while a separate labelled chevron controls disclosure. A root or child route opens its group automatically. Only one group or flyout is open at a time: opening or navigating into another group closes the previous one, while users may still close the active group manually. In the collapsed state the root icon opens a flyout with a selectable Overview row before the children. When an application already supplies a child for the root route or labels one Overview, that item is reused instead of rendering a duplicate synthetic row. Escape, outside interaction, and selection close the flyout and restore focus to its trigger. Child rows have no decorative guide line, start after a 4px disclosure gap, and stretch to the navigation edge. Collapsed inactive icons use the secondary text tier for contrast while active icons remain action blue. Applications supply route-aware data, links, and localized disclosure labels.

Pass Hugeicons icon data for ordinary navigation concepts. A
`SidebarNavigationItem` may instead receive an application-owned React element
for an integration or product brand mark. The shared slot sizes, contains, and
rounds that artwork consistently; the application owns the asset and supplies
decorative alternative text when the adjacent label already names it.

When sibling routes overlap, the application marks only the longest matching child active. The root remains visually active as the ancestor, but only the selected page receives `aria-current="page"`.

Close the overlay after an in-app navigation without changing the desktop preference:

```tsx
const { isOverlay, setOpenMobile } = useSidebar()

<Link
  to={item.to}
  onClick={() => {
    if (isOverlay) setOpenMobile(false)
  }}
>
  {item.label}
</Link>
```

Expanded state is intentionally independent from overlay state. Opening the tablet or mobile sheet does not change the user's desktop preference.

The desktop sidebar starts expanded and the tablet/mobile overlay starts closed unless the application controls those states.

The desktop state is uncontrolled by default. Applications that persist it must own that policy:

```tsx
<AppShell
  labels={labels}
  open={sidebarOpen}
  onOpenChange={setSidebarOpen}
>
  {children}
</AppShell>
```

The shared package does not write cookies or local storage. Set `keyboardShortcut={false}` to disable the default <kbd>Cmd/Ctrl+B</kbd> shortcut, or pass another single key.

## Header contract

`AppHeader` is the fixed 54px global action row. `AppHeaderStart` contains the mobile sidebar trigger, desktop collapse button, workspace or module context, and breadcrumbs. `AppHeaderActions` contains global actions such as notifications or account controls. Global search belongs below the sidebar identity through `SidebarSearchButton`, not in `AppHeaderActions`.

- Do keep the sidebar trigger reachable on tablet and mobile.
- Do give icon-only header actions translated accessible names.
- Do let actions wrap or move into a menu before they overlap the start section.
- Do keep one owner for each control: global and module controls use
  `AppHeaderActions`; route controls use `PageActions`; region controls stay in
  their region.
- Don't put a page heading in `AppHeader`; use `PageTitle` so document hierarchy remains predictable.
- Don't render a second breadcrumb trail, route title, back button, search field,
  or duplicate action group inside the route body.

Routes that intentionally remove application chrome can omit `AppShell` and `AppHeader` without adding a mode to the shared package.

### Scroll-aware route header

`AppShellMain` automatically compacts a route header while its `PageContent`
leaves the top. The compact state keeps the 54px application header, replaces
the breadcrumb with the route title, moves `PageActions` to the right side when
present, hides the route description, and leaves `PageHeaderTabs` as a slim row
when a page has tabs. The compact header keeps its bottom separator. Returning
to the top restores the full route header; scroll direction does not affect the
state.

Compaction is enabled only when all of these conditions remain true:

- the header is at least 640px wide and the measured title, breadcrumb,
  controls, and active trailing action group fit without crowding;
- at most one trailing action group is visible: global controls in
  `AppHeaderActions` or route controls in `PageActions`, but not both;
- the normalized `PageTitle` and final `BreadcrumbPage` labels match.

Global-only controls remain anchored in `AppHeaderActions` while the title
compacts. Route-only controls transfer from `PageActions` into the application
header. When both groups are visible, the route header remains expanded so the
controls never compete for the same trailing space.

Scroll position directly controls the motion. The first scroll range is the
measured height of the route header's collapsible primary row: zero is fully
expanded and the end of that range is fully compact. The route header is
overlaid above `PageContent`, whose scroll area reserves the expanded header
height, so collapsing does not resize the viewport or accelerate the content.
The breadcrumb fades out completely before the stable compact title fades in;
header geometry and the existing action container follow the same scroll
progress without a fixed animation duration. Reduced-motion users receive a
discrete state change after the same scroll range. Applications keep ownership
of labels, routing, actions, fields, and tab state; no route-specific collapse
configuration is needed.

### Page and route transitions

The shell adds motion at the two navigation surfaces it owns. Changing a
`PageHeaderTabs` selection crossfades the page content with a 10px horizontal
offset. Moving to a later tab sends the previous content left and brings the
next content from the right; moving to an earlier tab reverses those
directions. Other tab lists keep their normal local behavior.

Route changes inside `AppRouteTransition`, including routes selected through
`SidebarNavigation`, replace `PageHeader` immediately and crossfade only
`PageContent`: the previous body leaves 8px downward while the new body enters
from 10px above. This also keeps transitions stable when one route has header
tabs and the other does not. `AppHeader` and the sidebar remain anchored, so the
navigation context updates without making the whole application frame move.

`AppRouteTransition` uses `react-transition-group` to keep the previous outlet
mounted for its exit CSS transition while the next outlet enters. The
application remains responsible for React Router and supplies the current
pathname and outlet:

```tsx
const location = useLocation()
const outlet = useOutlet()

<AppRouteTransition transitionKey={location.pathname}>
  {outlet}
</AppRouteTransition>
```

Only the active route may publish breadcrumbs, `PageActions`, or other shell
slot content. Exit content may remain mounted for body motion, but its shell
registrations must be replaced or keyed out before the next frame so controls
do not duplicate, shift, or navigate back to the previous route.

The shared `Tabs` state automatically coordinates `PageHeaderTabs` and their
`TabsContent` panels; applications keep ownership of controlled or uncontrolled
tab values. `prefers-reduced-motion: reduce` disables both route and tab motion
and changes content immediately.

`PageActions` also transitions changes to its action composition without a
route-level opt-in. It reconciles actions individually so matching controls
stay mounted and fully opaque while only added, removed, or replaced controls
crossfade. Action changes use opacity only; individual controls never slide.
The action row stays trailing-edge aligned, and the portal anchor updates
before paint so a width change does not reposition the remaining controls
twice. Initial render and prop-only updates to the same controls stay still.
Reduced-motion users receive an immediate action swap.

## Page contract

```tsx
import {
  Badge,
  Button,
  ContentRegion,
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageHeaderTabs,
  PageTitle,
  PageTitleRow,
  Tabs,
  TabsContent,
  TabsTrigger,
} from '@guideshot/ui'

function ProductsPage() {
  return (
    <Page>
      <Tabs defaultValue="all" className="min-h-0 flex-1 gap-0">
        <PageHeader>
          <PageHeaderContent>
            <PageTitleRow>
              <PageTitle>{t('products.title')}</PageTitle>
              <Badge>{t('products.scope')}</Badge>
            </PageTitleRow>
            <PageDescription>{t('products.description')}</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <Button>{t('products.create')}</Button>
          </PageActions>
          <PageHeaderTabs aria-label={t('products.sections')}>
            <TabsTrigger value="all">{t('products.all')}</TabsTrigger>
            <TabsTrigger value="archived">
              {t('products.archived')}
            </TabsTrigger>
          </PageHeaderTabs>
        </PageHeader>

        <PageContent width="wide">
          <TabsContent value="all">
            <ContentRegion aria-labelledby="products-results-title">
              <h2 id="products-results-title">{t('products.results')}</h2>
              {results}
            </ContentRegion>
          </TabsContent>
          <TabsContent value="archived">{archivedResults}</TabsContent>
        </PageContent>
      </Tabs>
    </Page>
  )
}
```

`PageContent` supports three width contracts:

- `full` is the default for dashboards, tables, editors, and split views.
- `wide` constrains ordinary application pages to `max-w-7xl`.
- `content` constrains reading and form layouts to `max-w-5xl`.

Spacing is `default`, `compact`, or `none`. Use `none` only when a child owns edge spacing, such as a full-bleed table or canvas.

`PageContent` owns vertical page scrolling by default. Set
`scrollMode="contained"` only when a height-constrained child such as a
table-first workspace becomes the sole vertical scroll owner; pair it with the
child's contained scroll mode. Never introduce a second vertical scrollbar
inside the default page-scrolling mode.

`ContentRegion` is a semantic section without card styling. Give it an accessible name with `aria-labelledby` when the heading is elsewhere. Use `Card` inside it when content needs a raised or bordered surface.

- Do render one `PageTitle` as the route's `h1`.
- Do let the shell breadcrumb own hierarchical location and normal navigation;
  add a separate back action only when the product workflow has an explicit
  non-hierarchical return target.
- Do compose optional metadata beside the title with `PageTitleRow`.
- Do use `PageHeaderTabs` for route-local tabs; it owns the line treatment, overflow, and sliding indicator while the page owns tab state and content.
- Do keep page actions application-owned and responsive.
- Do use `ContentRegion` to mark meaningful page sections, not every layout wrapper.
- Don't add loading, empty, error, query, or retry logic to layout primitives; compose the core state primitives instead.
- Don't use `PageContent` width variants to encode domain-specific layouts.
