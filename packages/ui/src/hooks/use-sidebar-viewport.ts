import * as React from 'react'

const MOBILE_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024

export type SidebarViewport = 'mobile' | 'tablet' | 'desktop'

function getSnapshot(): SidebarViewport {
  if (window.innerWidth < MOBILE_BREAKPOINT) return 'mobile'
  if (window.innerWidth < DESKTOP_BREAKPOINT) return 'tablet'
  return 'desktop'
}

function getServerSnapshot(): SidebarViewport {
  return 'desktop'
}

function subscribe(onStoreChange: () => void) {
  const mobileQuery = window.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
  )
  const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)

  mobileQuery.addEventListener('change', onStoreChange)
  desktopQuery.addEventListener('change', onStoreChange)

  return () => {
    mobileQuery.removeEventListener('change', onStoreChange)
    desktopQuery.removeEventListener('change', onStoreChange)
  }
}

export function useSidebarViewport() {
  const viewport = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  return {
    viewport,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isOverlay: viewport !== 'desktop',
  }
}
