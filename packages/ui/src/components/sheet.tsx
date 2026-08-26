import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@guideshot/ui/components/button'
import { Icon } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'
import { Dialog as SheetPrimitive } from 'radix-ui'
import * as React from 'react'

type SheetNestingContextValue = {
  isCovered: boolean
  isNested: boolean
  setNestedSheetOpen: (id: string, open: boolean) => void
}

const SheetNestingContext =
  React.createContext<SheetNestingContextValue | null>(null)

const sheetMotionDuration = 240
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

type SheetProps = React.ComponentProps<typeof SheetPrimitive.Root> & {
  nested?: boolean
}

function Sheet({
  nested = false,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: SheetProps) {
  const parentSheet = React.useContext(SheetNestingContext)
  const sheetId = React.useId()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  )
  const [openNestedSheets, setOpenNestedSheets] = React.useState<Set<string>>(
    () => new Set()
  )
  const isOpen = open ?? uncontrolledOpen
  const isNested = nested && parentSheet !== null
  const parentSetNestedSheetOpen = parentSheet?.setNestedSheetOpen

  const setNestedSheetOpen = React.useCallback(
    (id: string, nextOpen: boolean) => {
      setOpenNestedSheets(current => {
        const hasSheet = current.has(id)
        if (hasSheet === nextOpen) return current

        const next = new Set(current)
        if (nextOpen) next.add(id)
        else next.delete(id)
        return next
      })
    },
    []
  )

  useIsomorphicLayoutEffect(() => {
    if (!isNested || !parentSetNestedSheetOpen) return

    if (isOpen) {
      parentSetNestedSheetOpen(sheetId, true)
      return
    }

    const timeoutId = window.setTimeout(
      () => parentSetNestedSheetOpen(sheetId, false),
      typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : sheetMotionDuration
    )

    return () => window.clearTimeout(timeoutId)
  }, [isNested, isOpen, parentSetNestedSheetOpen, sheetId])

  useIsomorphicLayoutEffect(() => {
    if (!isNested || !parentSetNestedSheetOpen) return
    return () => parentSetNestedSheetOpen(sheetId, false)
  }, [isNested, parentSetNestedSheetOpen, sheetId])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setUncontrolledOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [onOpenChange, open]
  )

  const nestingContext = React.useMemo<SheetNestingContextValue>(
    () => ({
      isCovered: openNestedSheets.size > 0,
      isNested,
      setNestedSheetOpen,
    }),
    [isNested, openNestedSheets.size, setNestedSheetOpen]
  )

  return (
    <SheetNestingContext.Provider value={nestingContext}>
      <SheetPrimitive.Root
        data-slot="sheet"
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </SheetNestingContext.Provider>
  )
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
  const sheet = React.useContext(SheetNestingContext)

  return (
    <SheetPrimitive.Overlay
      ref={ref}
      data-slot="sheet-overlay"
      data-nested={sheet?.isNested || undefined}
      className={cn(
        'fixed inset-0 z-50 duration-200 ease-disclosure motion-reduce:duration-0 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        sheet?.isNested
          ? 'bg-black/10 backdrop-blur-none'
          : 'bg-black/30 supports-backdrop-filter:backdrop-blur-xs',
        className
      )}
      {...props}
    />
  )
})

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> &
  (
    | { showCloseButton?: true; closeLabel: string }
    | { showCloseButton: false; closeLabel?: never }
  ) & {
    side?: 'top' | 'right' | 'bottom' | 'left'
  }

function SheetContent({
  className,
  children,
  side = 'right',
  closeLabel,
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  const sheet = React.useContext(SheetNestingContext)

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        data-covered={sheet?.isCovered || undefined}
        data-nested={sheet?.isNested || undefined}
        className={cn(
          'fixed inset-y-2 right-2 z-50 flex w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] flex-col overflow-hidden rounded-xl border border-border bg-popover bg-clip-padding text-body text-popover-foreground shadow-floating outline-none transition duration-[240ms] ease-disclosure will-change-transform motion-reduce:duration-0 data-[covered=true]:[scale:.98] sm:max-w-[30rem] data-[side=right]:origin-right data-[side=right]:data-[covered=true]:[translate:-.5rem_0] sm:data-[side=right]:data-[covered=true]:[translate:-1rem_0] data-[side=bottom]:inset-x-2 data-[side=bottom]:top-auto data-[side=bottom]:bottom-2 data-[side=bottom]:h-auto data-[side=bottom]:max-h-[calc(100%-1rem)] data-[side=bottom]:w-auto data-[side=bottom]:max-w-none data-[side=bottom]:origin-bottom data-[side=bottom]:data-[covered=true]:[translate:0_-.5rem] sm:data-[side=bottom]:data-[covered=true]:[translate:0_-1rem] data-[side=left]:right-auto data-[side=left]:left-2 data-[side=left]:origin-left data-[side=left]:data-[covered=true]:[translate:.5rem_0] sm:data-[side=left]:data-[covered=true]:[translate:1rem_0] data-[side=top]:inset-x-2 data-[side=top]:top-2 data-[side=top]:bottom-auto data-[side=top]:h-auto data-[side=top]:max-h-[calc(100%-1rem)] data-[side=top]:w-auto data-[side=top]:max-w-none data-[side=top]:origin-top data-[side=top]:data-[covered=true]:[translate:0_.5rem] sm:data-[side=top]:data-[covered=true]:[translate:0_1rem] data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-6 data-[side=left]:data-open:slide-in-from-left-6 data-[side=right]:data-open:slide-in-from-right-6 data-[side=top]:data-open:slide-in-from-top-6 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-6 data-[side=left]:data-closed:slide-out-to-left-6 data-[side=right]:data-closed:slide-out-to-right-6 data-[side=top]:data-closed:slide-out-to-top-6',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              size="icon-sm"
            >
              <Icon icon={Cancel01Icon} size={12} />
              <span className="sr-only">{closeLabel}</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        'font-heading text-card-title font-semibold tracking-card-title text-foreground',
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-control text-text-meta', className)}
      {...props}
    />
  )
}

export type { SheetContentProps, SheetProps }
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
