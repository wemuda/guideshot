'use client'

import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { useReducedMotion } from '../hooks/use-reduced-motion'

const appRouteTransitionDuration = {
  enter: 240,
  exit: 180,
}

type AppRouteTransitionProps = {
  children: React.ReactNode
  className?: string
  mode?: 'overlap' | 'enter-only'
  transitionKey: React.Key
}

type RouteTransitionItemProps = {
  appear?: boolean
  children: React.ReactNode
  enter?: boolean
  exit?: boolean
  in?: boolean
  onExited?: () => void
  reducedMotion: boolean
}

type AppRouteTransitionItemContextValue = {
  isActive: boolean
  setTransitionNode: (element: HTMLElement | null) => void
}

const AppRouteTransitionItemContext =
  React.createContext<AppRouteTransitionItemContextValue | null>(null)

function useAppRouteTransitionNode() {
  return React.useContext(AppRouteTransitionItemContext)?.setTransitionNode
}

function useIsAppRouteTransitionActive() {
  return React.useContext(AppRouteTransitionItemContext)?.isActive ?? true
}

function RouteTransitionItem({
  appear,
  children,
  enter,
  exit,
  in: inProp = false,
  onExited,
  reducedMotion,
}: RouteTransitionItemProps) {
  const nodeRef = React.useRef<HTMLElement | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const setTransitionNode = React.useCallback((element: HTMLElement | null) => {
    nodeRef.current = element ?? wrapperRef.current
  }, [])
  const setWrapper = React.useCallback((element: HTMLDivElement | null) => {
    wrapperRef.current = element
    if (element && !nodeRef.current) nodeRef.current = element
  }, [])
  const context = React.useMemo<AppRouteTransitionItemContextValue>(
    () => ({ isActive: inProp, setTransitionNode }),
    [inProp, setTransitionNode]
  )

  return (
    <CSSTransition
      appear={appear}
      classNames="app-shell-route"
      enter={!reducedMotion && enter !== false}
      exit={!reducedMotion && exit !== false}
      in={inProp}
      nodeRef={nodeRef}
      onExited={onExited}
      timeout={reducedMotion ? 0 : appRouteTransitionDuration}
      unmountOnExit
    >
      <div
        ref={setWrapper}
        data-slot="app-route-transition-item"
        data-state={inProp ? 'active' : 'exiting'}
        aria-hidden={inProp ? undefined : true}
      >
        <AppRouteTransitionItemContext.Provider value={context}>
          {children}
        </AppRouteTransitionItemContext.Provider>
      </div>
    </CSSTransition>
  )
}

function AppRouteTransition({
  children,
  className,
  mode = 'overlap',
  transitionKey,
}: AppRouteTransitionProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div data-slot="app-route-transition" className={cn(className)}>
      {mode === 'enter-only' ? (
        <RouteTransitionItem
          key={transitionKey}
          appear
          exit={false}
          in
          reducedMotion={reducedMotion}
        >
          {children}
        </RouteTransitionItem>
      ) : (
        <TransitionGroup component={null}>
          <RouteTransitionItem
            key={transitionKey}
            reducedMotion={reducedMotion}
          >
            {children}
          </RouteTransitionItem>
        </TransitionGroup>
      )}
    </div>
  )
}

export type { AppRouteTransitionProps }
export {
  AppRouteTransition,
  appRouteTransitionDuration,
  useAppRouteTransitionNode,
  useIsAppRouteTransitionActive,
}
