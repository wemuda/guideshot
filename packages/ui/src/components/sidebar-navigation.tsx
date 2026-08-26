'use client'

import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@guideshot/ui/components/collapsible'
import { Icon, type IconData } from '@guideshot/ui/components/icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@guideshot/ui/components/popover'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@guideshot/ui/components/sidebar'
import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'

type SidebarNavigationItem = {
  badge?: React.ReactNode
  href?: string
  icon?: IconData | React.ReactElement
  id: string
  isActive?: boolean
  items?: SidebarNavigationItem[]
  label: string
}

function NavigationItemIcon({
  icon,
  size,
}: {
  icon: SidebarNavigationItem['icon']
  size: 16 | 20
}) {
  if (!icon) return null

  if (React.isValidElement(icon)) {
    return (
      <span
        data-slot="sidebar-navigation-brand-icon"
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-contain',
          size === 20 ? 'size-5' : 'size-4'
        )}
      >
        {icon}
      </span>
    )
  }

  return <Icon icon={icon as IconData} size={size} />
}

type SidebarNavigationRenderLink = (
  item: SidebarNavigationItem,
  children: React.ReactNode,
  onNavigate: () => void
) => React.ReactElement

type SidebarNavigationLabels = {
  collapseGroup: (label: string) => string
  expandGroup: (label: string) => string
  overview: string
}

type SidebarNavigationProps = {
  className?: string
  items: SidebarNavigationItem[]
  label: React.ReactNode
  labels: SidebarNavigationLabels
  renderLink: SidebarNavigationRenderLink
}

function NavigationItemContent({ item }: { item: SidebarNavigationItem }) {
  return (
    <>
      <NavigationItemIcon icon={item.icon} size={20} />
      <span>{item.label}</span>
      {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
    </>
  )
}

function normalizeNavigationHref(href?: string) {
  if (!href) return undefined
  return href === '/' ? href : href.replace(/\/+$/, '')
}

function NavigationLeaf({
  item,
  onNavigate,
  renderLink,
  sub = false,
}: {
  item: SidebarNavigationItem
  onNavigate: () => void
  renderLink: SidebarNavigationRenderLink
  sub?: boolean
}) {
  const content = <NavigationItemContent item={item} />
  const link = renderLink(item, content, onNavigate)

  if (sub) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          isActive={item.isActive}
          aria-current={item.isActive ? 'page' : undefined}
        >
          {link}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={item.isActive}
        tooltip={item.label}
        aria-label={item.label}
        aria-current={item.isActive ? 'page' : undefined}
      >
        {link}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavigationGroup({
  expandedOpen,
  flyoutOpen,
  item,
  labels,
  onExpandedOpenChange,
  onFlyoutOpenChange,
  onGroupNavigate,
  renderLink,
}: {
  expandedOpen: boolean
  flyoutOpen: boolean
  item: SidebarNavigationItem
  labels: SidebarNavigationLabels
  onExpandedOpenChange: (open: boolean) => void
  onFlyoutOpenChange: (open: boolean) => void
  onGroupNavigate: () => void
  renderLink: SidebarNavigationRenderLink
}) {
  const { isOverlay, setOpenMobile, state } = useSidebar()
  const active = Boolean(
    item.isActive || item.items?.some(child => child.isActive)
  )
  const collapsed = state === 'collapsed' && !isOverlay
  const normalizedRootHref = normalizeNavigationHref(item.href)
  const providedOverviewItem = item.items?.find(child => {
    const normalizedChildHref = normalizeNavigationHref(child.href)
    return (
      (normalizedRootHref && normalizedRootHref === normalizedChildHref) ||
      child.label.trim().toLocaleLowerCase() ===
        labels.overview.trim().toLocaleLowerCase()
    )
  })

  const handleNavigate = React.useCallback(() => {
    onGroupNavigate()
    if (isOverlay) setOpenMobile(false)
  }, [isOverlay, onGroupNavigate, setOpenMobile])
  const overviewItem: SidebarNavigationItem =
    providedOverviewItem ??
    ({
      ...item,
      icon: undefined,
      id: `${item.id}:overview`,
      items: undefined,
      label: labels.overview,
    } satisfies SidebarNavigationItem)
  const flyoutChildren = item.items?.filter(
    child => child.id !== providedOverviewItem?.id
  )

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <Popover modal open={flyoutOpen} onOpenChange={onFlyoutOpenChange}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              isActive={active}
              tooltip={item.label}
              aria-label={item.label}
              aria-expanded={flyoutOpen}
            >
              <NavigationItemContent item={item} />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={16}
            collisionPadding={10}
            className="w-[226px] gap-0 p-[5px]"
          >
            <div className="mb-1 flex items-center gap-2 border-b border-separator px-[9px] py-2">
              <span className="flex size-4 shrink-0 items-center justify-center text-primary [&_svg]:size-4">
                <NavigationItemIcon icon={item.icon} size={16} />
              </span>
              <span className="truncate text-body font-semibold tracking-card-title">
                {item.label}
              </span>
            </div>
            <div className="flex flex-col gap-px">
              <NavigationLeaf
                item={overviewItem}
                onNavigate={handleNavigate}
                renderLink={renderLink}
                sub
              />
              {flyoutChildren?.map(child => (
                <NavigationLeaf
                  key={child.id}
                  item={child}
                  onNavigate={handleNavigate}
                  renderLink={renderLink}
                  sub
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      asChild
      open={expandedOpen}
      onOpenChange={onExpandedOpenChange}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <div
          data-active={active}
          className="flex min-w-0 items-center rounded-md data-[active=true]:bg-sidebar-accent"
        >
          <SidebarMenuButton
            asChild
            isActive={active}
            tooltip={item.label}
            aria-current={item.isActive ? 'page' : undefined}
            className="peer/root-link min-w-0 flex-1 rounded-r-none pr-1"
          >
            {renderLink(
              item,
              <NavigationItemContent item={item} />,
              handleNavigate
            )}
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group/group-toggle flex h-[33px] w-8 shrink-0 items-center justify-center rounded-r-md text-text-meta outline-none transition-colors duration-150 ease-out peer-hover/root-link:bg-sidebar-accent peer-hover/root-link:text-foreground hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:duration-0"
              aria-label={
                expandedOpen
                  ? labels.collapseGroup(item.label)
                  : labels.expandGroup(item.label)
              }
            >
              <Icon
                icon={ArrowRight01Icon}
                size={12}
                className="transition-transform duration-200 ease-disclosure group-data-[state=open]/group-toggle:rotate-90 motion-reduce:duration-0"
              />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-sidebar-collapse-up data-[state=open]:animate-sidebar-collapse-down motion-reduce:animate-none">
          <SidebarMenuSub>
            {item.items?.map(child => (
              <NavigationLeaf
                key={child.id}
                item={child}
                onNavigate={handleNavigate}
                renderLink={renderLink}
                sub
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SidebarNavigation({
  className,
  items,
  label,
  labels,
  renderLink,
}: SidebarNavigationProps) {
  const { isOverlay, setOpenMobile } = useSidebar()
  const activeGroupId = items.find(
    item =>
      item.items?.length &&
      (item.isActive || item.items.some(child => child.isActive))
  )?.id
  const [openGroupId, setOpenGroupId] = React.useState<string | null>(
    activeGroupId ?? null
  )
  const [openFlyoutId, setOpenFlyoutId] = React.useState<string | null>(null)
  const previousActiveGroupId = React.useRef(activeGroupId)

  React.useEffect(() => {
    if (activeGroupId === previousActiveGroupId.current) return
    previousActiveGroupId.current = activeGroupId
    setOpenGroupId(activeGroupId ?? null)
    setOpenFlyoutId(null)
  }, [activeGroupId])

  const handleNavigate = React.useCallback(() => {
    if (isOverlay) setOpenMobile(false)
  }, [isOverlay, setOpenMobile])

  return (
    <SidebarGroup className={cn(className)}>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item =>
          item.items?.length ? (
            <NavigationGroup
              key={item.id}
              expandedOpen={openGroupId === item.id}
              flyoutOpen={openFlyoutId === item.id}
              item={item}
              labels={labels}
              onExpandedOpenChange={open =>
                setOpenGroupId(open ? item.id : null)
              }
              onFlyoutOpenChange={open =>
                setOpenFlyoutId(open ? item.id : null)
              }
              onGroupNavigate={() => {
                setOpenGroupId(item.id)
                setOpenFlyoutId(null)
              }}
              renderLink={renderLink}
            />
          ) : (
            <NavigationLeaf
              key={item.id}
              item={item}
              onNavigate={handleNavigate}
              renderLink={renderLink}
            />
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export type {
  SidebarNavigationItem,
  SidebarNavigationLabels,
  SidebarNavigationProps,
  SidebarNavigationRenderLink,
}
export { SidebarNavigation }
