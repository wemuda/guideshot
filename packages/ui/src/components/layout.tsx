import { SidebarInset, SidebarProvider } from '@guideshot/ui/components/sidebar'
import { cn } from '@guideshot/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { useReducedMotion } from '../hooks/use-reduced-motion'
import {
  useAppRouteTransitionNode,
  useIsAppRouteTransitionActive,
} from './app-route-transition'
import { PageHeaderTabsMotionScope, TabsList } from './tabs'

type PageElements = {
  isRouteActive: boolean
  page: HTMLElement | null
  header: HTMLElement | null
  title: HTMLElement | null
  actions: HTMLElement | null
  content: HTMLElement | null
}

type HeaderCollapseContextValue = {
  activePageId: string | null
  actionsTarget: HTMLElement | null
  collapseProgress: number
  isEligible: boolean
  registerPage: (id: string, elements: PageElements | null) => void
  setAppHeader: (element: HTMLElement | null) => void
  setAppHeaderStart: (element: HTMLElement | null) => void
  setActionsTarget: (element: HTMLElement | null) => void
  titleLabel: string
}

type PageRegistrationContextValue = {
  id: string
  isActive: boolean
  setActions: (element: HTMLElement | null) => void
  setContent: (element: HTMLElement | null) => void
  setHeader: (element: HTMLElement | null) => void
  setTitle: (element: HTMLElement | null) => void
}

const HeaderCollapseContext =
  React.createContext<HeaderCollapseContextValue | null>(null)
const PageRegistrationContext =
  React.createContext<PageRegistrationContextValue | null>(null)

const fallbackScrollCollapseDistance = 48
const minimumCollapseWidth = 640

function measureVisibleWidth(element: HTMLElement) {
  const style = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()

  const isVisible =
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    rect.width > 0 &&
    rect.height > 0

  return isVisible ? rect.width : null
}

function normalizeLabel(value: string | null | undefined) {
  return value
    ?.normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase()
}

function getCollapseState(progress: number) {
  if (progress >= 0.999) return 'collapsed'
  if (progress > 0) return 'collapsing'
  return 'expanded'
}

function measureTextWidth(element: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect().width
}

function getNumericStyle(style: CSSStyleDeclaration, property: string) {
  return Number.parseFloat(style.getPropertyValue(property)) || 0
}

function HeaderCollapseProvider({ children }: React.PropsWithChildren) {
  const [appHeader, setAppHeader] = React.useState<HTMLElement | null>(null)
  const [appHeaderStart, setAppHeaderStart] =
    React.useState<HTMLElement | null>(null)
  const [actionsTarget, setActionsTarget] = React.useState<HTMLElement | null>(
    null
  )
  const [titleLabel, setTitleLabel] = React.useState('')
  const [pages, setPages] = React.useState<Map<string, PageElements>>(new Map())
  const [activePageId, setActivePageId] = React.useState<string | null>(null)
  const [isEligible, setIsEligible] = React.useState(false)
  const [collapseProgress, setCollapseProgress] = React.useState(0)

  const registerPage = React.useCallback(
    (id: string, elements: PageElements | null) => {
      setPages(current => {
        if (elements) {
          const previous = current.get(id)
          if (
            previous?.page === elements.page &&
            previous.isRouteActive === elements.isRouteActive &&
            previous.header === elements.header &&
            previous.title === elements.title &&
            previous.actions === elements.actions &&
            previous.content === elements.content
          ) {
            return current
          }

          const next = new Map(current)
          next.set(id, elements)
          return next
        }

        if (!current.has(id)) return current

        const next = new Map(current)
        next.delete(id)
        return next
      })
    },
    []
  )

  React.useLayoutEffect(() => {
    const activePage = [...pages.entries()].find(([, elements]) => {
      if (!elements.isRouteActive || !elements.page?.isConnected) return false

      if (
        elements.page.closest(
          '[data-slot=app-route-transition-item][data-state=exiting]'
        )
      ) {
        return false
      }

      return !elements.page.closest(
        '[role=dialog], [data-slot=dialog-content], [data-slot=sheet-content]'
      )
    })

    const nextActivePageId = activePage?.[0] ?? null
    if (nextActivePageId !== activePageId) setActivePageId(nextActivePageId)
  }, [activePageId, pages])

  const activePage = activePageId ? pages.get(activePageId) : undefined

  React.useLayoutEffect(() => {
    if (
      !appHeader ||
      !appHeaderStart ||
      !actionsTarget ||
      !activePage?.header ||
      !activePage.title ||
      !activePage.content ||
      !activePage.header.isConnected ||
      !activePage.title.isConnected ||
      !activePage.content.isConnected
    ) {
      setTitleLabel('')
      setIsEligible(false)
      setCollapseProgress(0)
      return
    }

    const breadcrumb = appHeaderStart.querySelector<HTMLElement>(
      '[data-slot=breadcrumb]'
    )
    const breadcrumbPages = breadcrumb?.querySelectorAll<HTMLElement>(
      '[data-slot=breadcrumb-page]'
    )
    const lastBreadcrumb = breadcrumbPages?.[breadcrumbPages.length - 1]

    if (!breadcrumb || !lastBreadcrumb) {
      setIsEligible(false)
      setCollapseProgress(0)
      return
    }

    const updateEligibility = () => {
      setTitleLabel(activePage.title?.textContent?.trim() ?? '')
      const titleMatchesBreadcrumb =
        normalizeLabel(activePage.title?.textContent) ===
        normalizeLabel(lastBreadcrumb.textContent)
      const headerChildren = [...appHeader.children].filter(
        (child): child is HTMLElement => child instanceof HTMLElement
      )
      const globalActionWidths = headerChildren
        .filter(
          child =>
            child.dataset.slot !== 'app-header-start' &&
            child.dataset.slot !== 'app-header-route-actions' &&
            child.childNodes.length > 0
        )
        .map(measureVisibleWidth)
        .filter((width): width is number => width !== null)
      const hasGlobalActions = globalActionWidths.length > 0
      const hasDeclaredPageActions =
        activePage.actions?.dataset.hasActions === 'true'
      const visiblePageActionsWidth =
        activePage.actions && activePage.actions.childNodes.length > 0
          ? measureVisibleWidth(activePage.actions)
          : null
      const hasVisiblePageActions = visiblePageActionsWidth !== null
      const hasPageActions = hasDeclaredPageActions || hasVisiblePageActions
      const headerStyle = window.getComputedStyle(appHeader)
      const startStyle = window.getComputedStyle(appHeaderStart)
      const breadcrumbWidth = measureTextWidth(lastBreadcrumb)
      const titleWidth = measureTextWidth(activePage.title as HTMLElement)
      const pageActionsWidth = hasPageActions
        ? Math.max(
            activePage.actions?.scrollWidth ?? 0,
            visiblePageActionsWidth ?? 0
          )
        : 0
      const globalActionsWidth = globalActionWidths.reduce(
        (total, width) => total + width,
        0
      )
      const trailingActionsWidth = pageActionsWidth + globalActionsWidth
      const controlWidths = [...appHeaderStart.children]
        .filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement &&
            child !== breadcrumb &&
            child.dataset.slot !== 'app-header-route-title'
        )
        .map(measureVisibleWidth)
        .filter((width): width is number => width !== null)
      const controlsWidth = controlWidths.reduce(
        (total, width) => total + width,
        0
      )
      const startGap = getNumericStyle(startStyle, 'column-gap')
      const headerGap = getNumericStyle(headerStyle, 'column-gap')
      const horizontalPadding =
        getNumericStyle(headerStyle, 'padding-left') +
        getNumericStyle(headerStyle, 'padding-right')
      const textWidth = Math.max(
        titleWidth,
        Math.min(breadcrumbWidth, 280),
        140
      )
      const requiredWidth =
        horizontalPadding +
        controlsWidth +
        startGap * Math.max(controlWidths.length, 1) +
        textWidth +
        trailingActionsWidth +
        (trailingActionsWidth > 0 ? headerGap + 16 : 0) +
        24
      const hasAdequateRoom =
        appHeader.clientWidth >= minimumCollapseWidth &&
        requiredWidth <= appHeader.clientWidth
      const nextEligibility =
        titleMatchesBreadcrumb &&
        !(hasGlobalActions && hasPageActions) &&
        hasAdequateRoom

      setIsEligible(nextEligibility)
      if (!nextEligibility) setCollapseProgress(0)
    }

    updateEligibility()

    let frame: number | null = null
    const scheduleEligibility = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        updateEligibility()
      })
    }

    const resizeObserver = new ResizeObserver(scheduleEligibility)
    ;[
      appHeader,
      appHeaderStart,
      breadcrumb,
      activePage.header,
      activePage.title,
      activePage.actions,
    ].forEach(element => {
      if (element) resizeObserver.observe(element)
    })

    const mutationObserver = new MutationObserver(scheduleEligibility)
    mutationObserver.observe(appHeader, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    mutationObserver.observe(activePage.header, {
      attributes: true,
      attributeFilter: ['data-has-actions'],
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [actionsTarget, activePage, appHeader, appHeaderStart])

  React.useLayoutEffect(() => {
    const scrollElement = activePage?.content
    if (!scrollElement || !isEligible) return

    let frame: number | null = null
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const updateProgress = () => {
      frame = null
      const measuredCollapseDistance = Number.parseFloat(
        activePage.header?.dataset.collapseDistance ?? ''
      )
      const collapseDistance =
        measuredCollapseDistance > 0
          ? measuredCollapseDistance
          : fallbackScrollCollapseDistance
      const nextProgress = prefersReducedMotion
        ? Number(scrollElement.scrollTop >= collapseDistance)
        : Math.min(Math.max(scrollElement.scrollTop, 0) / collapseDistance, 1)

      setCollapseProgress(current =>
        Math.abs(current - nextProgress) < 0.001 ? current : nextProgress
      )
    }

    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    scrollElement.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [activePage?.content, activePage?.header, isEligible])

  const value = React.useMemo<HeaderCollapseContextValue>(
    () => ({
      activePageId,
      actionsTarget,
      collapseProgress,
      isEligible,
      registerPage,
      setAppHeader,
      setAppHeaderStart,
      setActionsTarget,
      titleLabel,
    }),
    [
      activePageId,
      actionsTarget,
      collapseProgress,
      isEligible,
      registerPage,
      titleLabel,
    ]
  )

  return (
    <HeaderCollapseContext.Provider value={value}>
      {children}
    </HeaderCollapseContext.Provider>
  )
}

function AppShell({
  className,
  ...props
}: React.ComponentProps<typeof SidebarProvider>) {
  return (
    <SidebarProvider
      data-slot="app-shell"
      className={cn('h-svh min-w-0 overflow-hidden bg-canvas', className)}
      {...props}
    />
  )
}

function AppShellMain({
  className,
  ...props
}: React.ComponentProps<typeof SidebarInset>) {
  return (
    <HeaderCollapseProvider>
      <SidebarInset
        data-slot="app-shell-main"
        className={cn('min-w-0 overflow-hidden bg-canvas', className)}
        {...props}
      />
    </HeaderCollapseProvider>
  )
}

function AppHeader({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<'header'>) {
  const context = React.useContext(HeaderCollapseContext)
  const collapseProgress = context?.isEligible ? context.collapseProgress : 0

  return (
    <header
      ref={context?.setAppHeader}
      data-slot="app-header"
      data-collapse-eligible={context?.isEligible ? 'true' : 'false'}
      data-collapse-progress={collapseProgress.toFixed(3)}
      data-route-header={getCollapseState(collapseProgress)}
      className={cn(
        'sticky top-0 z-30 flex h-[var(--app-header-height)] min-h-[var(--app-header-height)] shrink-0 items-center gap-2 border-b border-line bg-surface px-3',
        className
      )}
      style={{
        ...style,
        borderBottomColor: `color-mix(in srgb, var(--line) ${(1 - collapseProgress) * 100}%, transparent)`,
      }}
      {...props}
    >
      {children}
      <div
        ref={context?.setActionsTarget}
        data-slot="app-header-route-actions"
        className={cn(
          'ml-auto hidden shrink-0 items-center',
          context?.isEligible && 'flex'
        )}
      />
    </header>
  )
}

function AppHeaderStart({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  const context = React.useContext(HeaderCollapseContext)
  const startRef = React.useRef<HTMLDivElement | null>(null)
  const targetRef = React.useRef<HTMLDivElement | null>(null)
  const setAppHeaderStart = context?.setAppHeaderStart
  const collapseProgress = context?.isEligible ? context.collapseProgress : 0
  const breadcrumbOpacity = Math.max(1 - collapseProgress / 0.4, 0)
  const titleProgress = Math.max((collapseProgress - 0.4) / 0.6, 0)
  const setStart = React.useCallback(
    (element: HTMLDivElement | null) => {
      startRef.current = element
      setAppHeaderStart?.(element)
    },
    [setAppHeaderStart]
  )

  React.useLayoutEffect(() => {
    const start = startRef.current
    const target = targetRef.current
    const breadcrumb = start?.querySelector<HTMLElement>(
      '[data-slot=breadcrumb]'
    )
    if (!start || !target || !breadcrumb) return

    const updateAlignment = () => {
      const startRect = start.getBoundingClientRect()
      const breadcrumbRect = breadcrumb.getBoundingClientRect()
      const left = Math.max(breadcrumbRect.left - startRect.left, 0)

      target.style.left = `${left}px`
      target.style.width = `${Math.max(startRect.width - left, 0)}px`
    }

    updateAlignment()

    const resizeObserver = new ResizeObserver(updateAlignment)
    resizeObserver.observe(start)
    resizeObserver.observe(breadcrumb)

    return () => resizeObserver.disconnect()
  }, [context?.titleLabel])

  React.useLayoutEffect(() => {
    const breadcrumb = startRef.current?.querySelector<HTMLElement>(
      '[data-slot=breadcrumb]'
    )
    if (!breadcrumb) return

    const breadcrumbHidden = breadcrumbOpacity <= 0.001
    breadcrumb.style.opacity = String(breadcrumbOpacity)
    breadcrumb.style.pointerEvents = breadcrumbHidden ? 'none' : ''
    breadcrumb.style.visibility = breadcrumbHidden ? 'hidden' : ''
    breadcrumb.inert = breadcrumbHidden

    if (breadcrumbHidden) breadcrumb.setAttribute('aria-hidden', 'true')
    else breadcrumb.removeAttribute('aria-hidden')
  }, [breadcrumbOpacity])

  return (
    <div
      ref={setStart}
      data-slot="app-header-start"
      className={cn(
        'relative flex h-full min-w-0 items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
      <div
        ref={targetRef}
        data-slot="app-header-route-title"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 max-w-[min(32rem,50vw)] truncate font-heading text-[15px]/5 font-medium tracking-normal"
        style={{
          opacity: titleProgress,
          transform: 'translateY(-50%)',
          translate: `0 ${4 * (1 - titleProgress)}px`,
          visibility: titleProgress > 0 ? 'visible' : 'hidden',
        }}
      >
        {context?.titleLabel}
      </div>
    </div>
  )
}

const AppHeaderActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(function AppHeaderActions({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="app-header-actions"
      className={cn('ml-auto flex shrink-0 items-center gap-1.5', className)}
      {...props}
    />
  )
})

function Page({ className, ...props }: React.ComponentProps<'main'>) {
  const context = React.useContext(HeaderCollapseContext)
  const isRouteActive = useIsAppRouteTransitionActive()
  const id = React.useId()
  const elementsRef = React.useRef<PageElements>({
    isRouteActive,
    page: null,
    header: null,
    title: null,
    actions: null,
    content: null,
  })
  const registerPage = context?.registerPage

  const updateElement = React.useCallback(
    (
      key: Exclude<keyof PageElements, 'isRouteActive'>,
      element: HTMLElement | null
    ) => {
      elementsRef.current[key] = element
      if (!element) return

      registerPage?.(id, { ...elementsRef.current })
    },
    [id, registerPage]
  )
  const setPage = React.useCallback(
    (element: HTMLElement | null) => updateElement('page', element),
    [updateElement]
  )
  const setActions = React.useCallback(
    (element: HTMLElement | null) => updateElement('actions', element),
    [updateElement]
  )
  const setContent = React.useCallback(
    (element: HTMLElement | null) => updateElement('content', element),
    [updateElement]
  )
  const setHeader = React.useCallback(
    (element: HTMLElement | null) => updateElement('header', element),
    [updateElement]
  )
  const setTitle = React.useCallback(
    (element: HTMLElement | null) => updateElement('title', element),
    [updateElement]
  )

  React.useEffect(() => {
    elementsRef.current.isRouteActive = isRouteActive
    registerPage?.(id, { ...elementsRef.current })

    return () => {
      registerPage?.(id, null)
    }
  }, [id, isRouteActive, registerPage])

  const registration = React.useMemo<PageRegistrationContextValue>(
    () => ({
      id,
      isActive: isRouteActive && context?.activePageId === id,
      setActions,
      setContent,
      setHeader,
      setTitle,
    }),
    [
      context?.activePageId,
      id,
      isRouteActive,
      setActions,
      setContent,
      setHeader,
      setTitle,
    ]
  )

  return (
    <PageRegistrationContext.Provider value={registration}>
      <main
        ref={setPage}
        data-slot="page"
        className={cn(
          'relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden',
          className
        )}
        {...props}
      />
    </PageRegistrationContext.Provider>
  )
}

function PageHeader({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<'header'>) {
  const shellContext = React.useContext(HeaderCollapseContext)
  const pageContext = React.useContext(PageRegistrationContext)
  const headerRef = React.useRef<HTMLElement | null>(null)
  const collapseRegionRef = React.useRef<HTMLDivElement | null>(null)
  const setPageHeader = pageContext?.setHeader
  const collapseProgress =
    pageContext?.isActive && shellContext?.isEligible
      ? shellContext.collapseProgress
      : 0
  const childArray = React.Children.toArray(children)
  const tabs = childArray.filter(
    child => React.isValidElement(child) && child.type === PageHeaderTabs
  )
  const primaryContent = childArray.filter(
    child => !React.isValidElement(child) || child.type !== PageHeaderTabs
  )
  const hasTabs = tabs.length > 0
  const setHeader = React.useCallback(
    (element: HTMLElement | null) => {
      headerRef.current = element
      setPageHeader?.(element)
    },
    [setPageHeader]
  )

  React.useLayoutEffect(() => {
    const header = headerRef.current
    const collapseRegion = collapseRegionRef.current
    const primaryContent = collapseRegion?.firstElementChild?.firstElementChild
    const page = header?.closest<HTMLElement>('[data-slot=page]')
    if (
      !header ||
      !collapseRegion ||
      !page ||
      !(primaryContent instanceof HTMLElement)
    )
      return

    const compactElements = [...header.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child !== collapseRegion
    )
    const pageContent = page.querySelector<HTMLElement>(
      '[data-slot=page-content]'
    )
    const updateMetrics = () => {
      const collapseDistance = primaryContent.scrollHeight
      const compactHeight = compactElements.reduce(
        (height, element) => height + element.getBoundingClientRect().height,
        0
      )
      const borderHeight =
        Number.parseFloat(getComputedStyle(header).borderBottomWidth) || 0
      const contentPaddingTop = pageContent
        ? Number.parseFloat(getComputedStyle(pageContent).paddingTop) || 0
        : 0

      header.dataset.collapseDistance = String(collapseDistance)
      page.style.setProperty(
        '--page-header-expanded-height',
        `${collapseDistance + compactHeight + borderHeight}px`
      )
      page.style.setProperty(
        '--page-sticky-top',
        `${header.getBoundingClientRect().height - contentPaddingTop}px`
      )
    }

    updateMetrics()

    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(header)
    resizeObserver.observe(primaryContent)
    if (pageContent) resizeObserver.observe(pageContent)
    compactElements.forEach(element => resizeObserver.observe(element))

    return () => {
      resizeObserver.disconnect()
      page.style.removeProperty('--page-sticky-top')
    }
  }, [hasTabs])

  return (
    <header
      ref={setHeader}
      data-slot="page-header"
      data-collapse-progress={collapseProgress.toFixed(3)}
      data-state={getCollapseState(collapseProgress)}
      className={cn(
        'absolute inset-x-0 top-0 z-20 shrink-0 border-b border-line bg-surface px-5',
        className
      )}
      style={{
        ...style,
        borderBottomColor: 'var(--line)',
      }}
      {...props}
    >
      <div
        ref={collapseRegionRef}
        data-slot="page-header-collapse-region"
        className="grid"
        style={{ gridTemplateRows: `${1 - collapseProgress}fr` }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'grid grid-cols-1 gap-x-5 gap-y-3 pt-3.5 pb-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start',
              hasTabs && 'pb-3'
            )}
            style={{
              opacity: 1 - collapseProgress,
              translate: `0 ${-8 * collapseProgress}px`,
            }}
          >
            {primaryContent}
          </div>
        </div>
      </div>
      {tabs}
    </header>
  )
}

function PageHeaderContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-content"
      className={cn('min-w-0 self-center space-y-0.5', className)}
      {...props}
    />
  )
}

function PageTitleRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-title-row"
      className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}
      {...props}
    />
  )
}

function PageTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  const pageContext = React.useContext(PageRegistrationContext)
  return (
    <h1
      ref={pageContext?.setTitle}
      data-slot="page-title"
      className={cn(
        'font-heading text-page-title font-medium tracking-page-title',
        className
      )}
      {...props}
    />
  )
}

function PageDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-description"
      className={cn('text-body text-text-secondary', className)}
      {...props}
    />
  )
}

const pageActionsTransitionDuration = {
  enter: 220,
  exit: 160,
}

interface PageActionsTransitionItemProps {
  appear?: boolean
  children: React.ReactNode
  enter?: boolean
  exit?: boolean
  in?: boolean
  onExited?: () => void
  reducedMotion: boolean
}

function getActionTypeName(type: unknown): string {
  if (typeof type === 'string') return type
  if (typeof type === 'function') {
    const component = type as Function & { displayName?: string }
    return component.displayName || component.name || 'component'
  }
  if (typeof type === 'symbol') return type.description || 'fragment'
  if (typeof type === 'object' && type !== null && 'displayName' in type) {
    return String(type.displayName || 'component')
  }
  return 'component'
}

function getPageActionNodeSignature(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return `text:${String(node)}`
  }
  if (!React.isValidElement(node)) return String(node)

  const props = node.props as {
    'aria-label'?: unknown
    children?: React.ReactNode
    title?: unknown
  }
  const label =
    typeof props['aria-label'] === 'string'
      ? props['aria-label']
      : typeof props.title === 'string'
        ? props.title
        : ''
  const childNodes: React.ReactNode[] = React.Children.toArray(props.children)
  const childSignature = childNodes
    .map(child => getPageActionNodeSignature(child))
    .join(',')

  return `${getActionTypeName(node.type)}:${label}:${childSignature}`
}

function getPageActionTransitionItems(children: React.ReactNode) {
  const occurrences = new Map<string, number>()

  return React.Children.toArray(children).map(child => {
    const signature = getPageActionNodeSignature(child)
    const occurrence = occurrences.get(signature) ?? 0
    occurrences.set(signature, occurrence + 1)

    return {
      key: `${signature}:${occurrence}`,
      node: child,
    }
  })
}

function PageActionsTransitionItem({
  appear,
  children,
  enter,
  exit,
  in: inProp = false,
  onExited,
  reducedMotion,
}: PageActionsTransitionItemProps) {
  const nodeRef = React.useRef<HTMLDivElement | null>(null)

  const clearExitPosition = React.useCallback(() => {
    const node = nodeRef.current
    if (!node) return

    node.style.position = ''
    node.style.right = ''
    node.style.top = ''
    node.style.width = ''
    node.style.height = ''
  }, [])

  const freezeExitPosition = React.useCallback(() => {
    const node = nodeRef.current
    const parent = node?.parentElement
    if (!node || !parent) return

    const rect = node.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    node.style.position = 'absolute'
    node.style.right = `${parentRect.right - rect.right}px`
    node.style.top = `${rect.top - parentRect.top}px`
    node.style.width = `${rect.width}px`
    node.style.height = `${rect.height}px`
  }, [])

  React.useLayoutEffect(() => {
    const node = nodeRef.current
    if (!node) return
    if (inProp) node.removeAttribute('inert')
    else node.setAttribute('inert', '')
  }, [inProp])

  return (
    <CSSTransition
      appear={appear}
      classNames="page-actions-swap"
      enter={!reducedMotion && enter !== false}
      exit={!reducedMotion && exit !== false}
      in={inProp}
      nodeRef={nodeRef}
      onEnter={clearExitPosition}
      onExit={freezeExitPosition}
      onExited={onExited}
      timeout={reducedMotion ? 0 : pageActionsTransitionDuration}
      unmountOnExit
    >
      <div
        ref={nodeRef}
        data-slot="page-actions-item"
        data-state={inProp ? 'active' : 'exiting'}
        aria-hidden={inProp ? undefined : true}
        className={cn(
          'flex shrink-0 items-center will-change-opacity',
          !inProp && 'pointer-events-none'
        )}
      >
        {children}
      </div>
    </CSSTransition>
  )
}

function PageActions({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  const shellContext = React.useContext(HeaderCollapseContext)
  const pageContext = React.useContext(PageRegistrationContext)
  const reducedMotion = useReducedMotion()
  const isActive = Boolean(pageContext?.isActive)
  const collapseProgress =
    isActive && shellContext?.isEligible ? shellContext.collapseProgress : 0
  const isCollapsed = collapseProgress >= 0.999
  const actionsRef = React.useRef<HTMLDivElement | null>(null)
  const anchorRef = React.useRef<HTMLDivElement | null>(null)
  const transferRef = React.useRef<HTMLDivElement | null>(null)
  const progressRef = React.useRef(collapseProgress)
  const setPageActions = pageContext?.setActions
  const transitionItems = getPageActionTransitionItems(children)
  const shouldTransfer = Boolean(
    isActive && shellContext?.isEligible && shellContext.actionsTarget
  )

  progressRef.current = collapseProgress

  const setActionsElement = React.useCallback(
    (element: HTMLDivElement | null) => {
      actionsRef.current = element
      setPageActions?.(element)
    },
    [setPageActions]
  )

  const updateTransferPosition = React.useCallback(() => {
    const anchor = anchorRef.current
    const transfer = transferRef.current
    if (!anchor || !transfer) return

    transfer.style.transform = 'none'
    const targetRect = transfer.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()
    const inverseProgress = 1 - progressRef.current
    const x = (anchorRect.left - targetRect.left) * inverseProgress
    const y = (anchorRect.top - targetRect.top) * inverseProgress

    transfer.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }, [])

  React.useLayoutEffect(() => {
    const actions = actionsRef.current
    if (!actions) return

    const updateSize = () => {
      const rect = actions.getBoundingClientRect()
      const anchor = anchorRef.current
      if (anchor) {
        anchor.style.width = `${rect.width}px`
        anchor.style.height = `${rect.height}px`
      }
      updateTransferPosition()
    }

    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(actions)

    return () => resizeObserver.disconnect()
  }, [shouldTransfer, updateTransferPosition])

  React.useLayoutEffect(() => {
    if (!shouldTransfer) return
    updateTransferPosition()
  }, [collapseProgress, shouldTransfer, updateTransferPosition])

  React.useLayoutEffect(() => {
    const anchor = anchorRef.current
    const transfer = transferRef.current
    if (!shouldTransfer || !anchor || !transfer) return

    const resizeObserver = new ResizeObserver(updateTransferPosition)
    resizeObserver.observe(anchor)
    resizeObserver.observe(transfer)
    window.addEventListener('resize', updateTransferPosition)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateTransferPosition)
    }
  }, [shouldTransfer, updateTransferPosition])

  const actions = (
    <div
      ref={setActionsElement}
      data-slot="page-actions"
      data-has-actions={transitionItems.length > 0 ? 'true' : 'false'}
      data-header-collapsed={isCollapsed ? 'true' : 'false'}
      data-header-collapse-progress={collapseProgress.toFixed(3)}
      className={cn(
        'flex flex-wrap items-center sm:justify-self-end',
        className
      )}
      {...props}
    >
      <div
        data-slot="page-actions-transition"
        className={cn(
          'relative flex min-w-0 w-full items-center justify-end gap-2 sm:w-auto',
          shouldTransfer ? 'flex-nowrap' : 'flex-wrap'
        )}
      >
        <TransitionGroup component={null}>
          {transitionItems.map(item => (
            <PageActionsTransitionItem
              key={item.key}
              reducedMotion={reducedMotion}
            >
              {item.node}
            </PageActionsTransitionItem>
          ))}
        </TransitionGroup>
      </div>
    </div>
  )

  if (!shouldTransfer || !shellContext?.actionsTarget) return actions

  return (
    <>
      <div
        ref={anchorRef}
        data-slot="page-actions-anchor"
        aria-hidden="true"
        className="invisible sm:justify-self-end"
      />
      {createPortal(
        <div
          ref={transferRef}
          data-slot="page-actions-transfer"
          className="flex shrink-0 will-change-transform"
        >
          {actions}
        </div>,
        shellContext.actionsTarget
      )}
    </>
  )
}

type PageHeaderTabsProps = Omit<
  React.ComponentProps<typeof TabsList>,
  'variant'
>

function PageHeaderTabs({ className, ...props }: PageHeaderTabsProps) {
  return (
    <div
      data-slot="page-header-tabs"
      className="scroll-fade-x scroll-fade-4 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <PageHeaderTabsMotionScope>
        <TabsList
          variant="line"
          className={cn('h-auto min-w-max gap-5', className)}
          {...props}
        />
      </PageHeaderTabsMotionScope>
    </div>
  )
}

const pageContentVariants = cva(
  'flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-clip overflow-y-auto',
  {
    variants: {
      width: {
        content: 'mx-auto max-w-5xl',
        wide: 'mx-auto max-w-7xl',
        full: 'max-w-none',
      },
      spacing: {
        none: '',
        compact: 'px-4 pt-4 pb-5',
        default: 'px-5 pt-[18px] pb-[26px]',
      },
    },
    defaultVariants: {
      width: 'full',
      spacing: 'default',
    },
  }
)

type PageContentProps = React.ComponentProps<'div'> &
  VariantProps<typeof pageContentVariants> & {
    scrollMode?: 'page' | 'contained'
  }

function PageContent({
  className,
  children,
  scrollMode = 'page',
  width,
  spacing,
  ...props
}: PageContentProps) {
  const pageContext = React.useContext(PageRegistrationContext)
  const setRouteTransitionNode = useAppRouteTransitionNode()
  const setPageContent = pageContext?.setContent
  const setContent = React.useCallback(
    (element: HTMLDivElement | null) => {
      setPageContent?.(element)
      setRouteTransitionNode?.(element)
    },
    [setPageContent, setRouteTransitionNode]
  )

  return (
    <div
      ref={setContent}
      data-slot="page-content"
      data-scroll-mode={scrollMode}
      data-spacing={spacing ?? 'default'}
      className={cn(
        pageContentVariants({ width, spacing }),
        scrollMode === 'contained' && 'overflow-hidden',
        className
      )}
      {...props}
    >
      <div
        data-slot="page-header-spacer"
        aria-hidden="true"
        className="shrink-0"
        style={{ height: 'var(--page-header-expanded-height, 0px)' }}
      />
      <div data-slot="page-content-body" className="contents">
        {children}
      </div>
    </div>
  )
}

function ContentRegion({
  className,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      data-slot="content-region"
      className={cn('min-w-0', className)}
      {...props}
    />
  )
}

export type { PageContentProps, PageHeaderTabsProps }
export {
  AppHeader,
  AppHeaderActions,
  AppHeaderStart,
  AppShell,
  AppShellMain,
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
  pageContentVariants,
}
