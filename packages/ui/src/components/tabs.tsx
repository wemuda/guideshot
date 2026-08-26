'use client'

import { cn } from '@guideshot/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import * as React from 'react'
import { CSSTransition } from 'react-transition-group'
import { useReducedMotion } from '../hooks/use-reduced-motion'

type PageTabDirection = 'backward' | 'forward'

type TabsMotionContextValue = {
  direction: PageTabDirection
  isPageHeader: boolean
  registerPageHeader: () => () => void
  value: string
}

const TabsMotionContext = React.createContext<TabsMotionContextValue | null>(
  null
)

const pageTabTransitionDuration = {
  enter: 240,
  exit: 180,
}

const pageTabTransitionClassNames = {
  backward: {
    enter: 'app-shell-tab-backward-enter',
    enterActive: 'app-shell-tab-backward-enter-active',
    exit: 'app-shell-tab-backward-exit',
    exitActive: 'app-shell-tab-backward-exit-active',
  },
  forward: {
    enter: 'app-shell-tab-forward-enter',
    enterActive: 'app-shell-tab-forward-enter-active',
    exit: 'app-shell-tab-forward-exit',
    exitActive: 'app-shell-tab-forward-exit-active',
  },
}

function Tabs({
  className,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  value: valueProp,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const pageHeaderRegistrations = React.useRef(0)
  const [direction, setDirection] = React.useState<PageTabDirection>('forward')
  const [isPageHeader, setIsPageHeader] = React.useState(false)
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? ''
  )
  const value = valueProp ?? uncontrolledValue

  const registerPageHeader = React.useCallback(() => {
    pageHeaderRegistrations.current += 1
    setIsPageHeader(true)

    return () => {
      pageHeaderRegistrations.current = Math.max(
        pageHeaderRegistrations.current - 1,
        0
      )
      if (pageHeaderRegistrations.current === 0) setIsPageHeader(false)
    }
  }, [])

  const commitValue = React.useCallback(
    (nextValue: string) => {
      if (valueProp === undefined) setUncontrolledValue(nextValue)
      onValueChange?.(nextValue)
    },
    [onValueChange, valueProp]
  )

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (nextValue === value) return

      const root = rootRef.current
      const headerTabs = root
        ? [
            ...root.querySelectorAll<HTMLElement>(
              '[data-slot=page-header-tabs]'
            ),
          ].find(tabs => tabs.closest('[data-slot=tabs]') === root)
        : undefined

      if (headerTabs) {
        const triggers = [
          ...headerTabs.querySelectorAll<HTMLElement>(
            '[data-slot=tabs-trigger]'
          ),
        ].filter(trigger => trigger.closest('[data-slot=tabs]') === root)
        const currentIndex = triggers.findIndex(
          trigger => trigger.dataset.value === value
        )
        const nextIndex = triggers.findIndex(
          trigger => trigger.dataset.value === nextValue
        )

        if (currentIndex >= 0 && nextIndex >= 0) {
          setDirection(nextIndex > currentIndex ? 'forward' : 'backward')
        }
      }

      commitValue(nextValue)
    },
    [commitValue, value]
  )

  const motionContext = React.useMemo<TabsMotionContextValue>(
    () => ({ direction, isPageHeader, registerPageHeader, value }),
    [direction, isPageHeader, registerPageHeader, value]
  )

  return (
    <TabsMotionContext.Provider value={motionContext}>
      <TabsPrimitive.Root
        ref={rootRef}
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          'group/tabs flex gap-2 data-horizontal:flex-col',
          className
        )}
        onValueChange={handleValueChange}
        orientation={orientation}
        {...props}
        value={value}
      />
    </TabsMotionContext.Provider>
  )
}

function PageHeaderTabsMotionScope({ children }: React.PropsWithChildren) {
  const context = React.useContext(TabsMotionContext)
  const registerPageHeader = context?.registerPageHeader

  React.useLayoutEffect(() => registerPageHeader?.(), [registerPageHeader])

  return <>{children}</>
}

const tabsListVariants = cva(
  'group/tabs-list relative isolate inline-flex w-fit items-center justify-center rounded-lg p-0.5 text-text-meta group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none data-[variant=line]:p-0',
  {
    variants: {
      variant: {
        default: 'border border-control-border bg-muted',
        line: 'gap-5 border-0 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type TabsIndicatorPosition = {
  width: number
  height: number
  transform: string
  opacity: number
  animate: boolean
}

const tabsIndicatorDuration = 240

function TabsList({
  className,
  indicatorClassName,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & {
    indicatorClassName?: string
  }) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const hasPositioned = React.useRef(false)
  const [indicatorPosition, setIndicatorPosition] =
    React.useState<TabsIndicatorPosition>({
      width: 0,
      height: 0,
      transform: 'translate3d(0, 0, 0)',
      opacity: 0,
      animate: false,
    })

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const updateIndicator = () => {
      const activeTrigger = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]'
      )

      if (!activeTrigger) {
        setIndicatorPosition(position => ({ ...position, opacity: 0 }))
        return
      }

      const isLine = list.dataset.variant === 'line'
      const isVertical = list.dataset.orientation === 'vertical'
      const listRect = list.getBoundingClientRect()
      const triggerRect = activeTrigger.getBoundingClientRect()
      const scaleX = list.offsetWidth ? listRect.width / list.offsetWidth : 1
      const scaleY = list.offsetHeight ? listRect.height / list.offsetHeight : 1
      const triggerWidth = triggerRect.width / scaleX
      const triggerHeight = triggerRect.height / scaleY
      const listStyle = window.getComputedStyle(list)
      const paddingTop = Number.parseFloat(listStyle.paddingTop) || 0
      const paddingRight = Number.parseFloat(listStyle.paddingRight) || 0
      const paddingBottom = Number.parseFloat(listStyle.paddingBottom) || 0
      const paddingLeft = Number.parseFloat(listStyle.paddingLeft) || 0
      const triggerX =
        (triggerRect.left - listRect.left) / scaleX - list.clientLeft
      const triggerY =
        (triggerRect.top - listRect.top) / scaleY - list.clientTop
      let width = triggerWidth
      let height = triggerHeight
      let x = triggerX
      let y = triggerY

      if (isLine && isVertical) {
        width = 2
        x = list.clientWidth - width
      } else if (isLine) {
        height = 2
        y = list.clientHeight - height
      } else if (isVertical) {
        width = list.clientWidth - paddingLeft - paddingRight
        x = paddingLeft
      } else {
        height = list.clientHeight - paddingTop - paddingBottom
        y = paddingTop
      }

      setIndicatorPosition({
        width,
        height,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        opacity: 1,
        animate: hasPositioned.current,
      })
      hasPositioned.current = true
    }

    updateIndicator()

    const mutationObserver = new MutationObserver(updateIndicator)
    mutationObserver.observe(list, {
      attributes: true,
      attributeFilter: ['data-orientation', 'data-state', 'data-variant'],
      childList: true,
      subtree: true,
    })

    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(list)
    list
      .querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')
      .forEach(trigger => resizeObserver.observe(trigger))
    window.addEventListener('resize', updateIndicator)

    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [])

  return (
    <TabsPrimitive.List
      {...props}
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
    >
      {props.children}
      <span
        aria-hidden="true"
        data-slot="tabs-indicator"
        className={cn(
          'pointer-events-none absolute top-0 left-0 z-0 rounded-sm border border-control-border bg-surface transition-[width,height,transform,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-0 group-data-[variant=line]/tabs-list:bg-foreground',
          indicatorClassName
        )}
        style={{
          width: indicatorPosition.width,
          height: indicatorPosition.height,
          transform: indicatorPosition.transform,
          opacity: indicatorPosition.opacity,
          transitionDuration: indicatorPosition.animate
            ? `${tabsIndicatorDuration}ms`
            : '0ms',
        }}
      />
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-value={props.value}
      className={cn(
        "relative z-10 inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-sm border border-transparent bg-transparent px-2 py-1 text-cell font-medium whitespace-nowrap text-text-meta transition-colors duration-150 ease-out motion-reduce:transition-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        'group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-0',
        'data-active:text-foreground data-[state=active]:text-foreground',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const context = React.useContext(TabsMotionContext)
  const reducedMotion = useReducedMotion()
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const isActive = context?.value === props.value
  const isPageHeader = Boolean(context?.isPageHeader)
  const direction = context?.direction ?? 'forward'

  if (!context) {
    return (
      <TabsPrimitive.Content
        data-slot="tabs-content"
        className={cn('flex-1 text-body outline-none', className)}
        {...props}
      />
    )
  }

  return (
    <CSSTransition
      classNames={
        isPageHeader ? pageTabTransitionClassNames[direction] : undefined
      }
      enter={isPageHeader && !reducedMotion}
      exit={isPageHeader && !reducedMotion}
      in={isActive}
      mountOnEnter
      nodeRef={nodeRef}
      timeout={isPageHeader && !reducedMotion ? pageTabTransitionDuration : 0}
      unmountOnExit
    >
      <TabsPrimitive.Content
        {...props}
        ref={nodeRef}
        forceMount
        data-slot="tabs-content"
        data-page-tab-panel={isPageHeader ? 'true' : undefined}
        aria-hidden={!isActive ? true : props['aria-hidden']}
        className={cn(
          'flex-1 text-body outline-none',
          !isPageHeader && 'data-[state=inactive]:hidden',
          className
        )}
        tabIndex={isActive ? (props.tabIndex ?? 0) : -1}
      />
    </CSSTransition>
  )
}

export {
  PageHeaderTabsMotionScope,
  pageTabTransitionDuration,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsIndicatorDuration,
  tabsListVariants,
}
