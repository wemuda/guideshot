'use client'

import {
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  SearchIcon,
  SidebarLeftIcon,
} from '@hugeicons/core-free-icons'
import { Button } from '@guideshot/ui/components/button'
import { Icon } from '@guideshot/ui/components/icon'
import { Input } from '@guideshot/ui/components/input'
import { Kbd, KbdGroup } from '@guideshot/ui/components/kbd'
import { Separator } from '@guideshot/ui/components/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@guideshot/ui/components/sheet'
import { Skeleton } from '@guideshot/ui/components/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@guideshot/ui/components/tooltip'
import {
  type SidebarViewport,
  useSidebarViewport,
} from '@guideshot/ui/hooks/use-sidebar-viewport'
import { cn } from '@guideshot/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

const SIDEBAR_WIDTH = '15.25rem'
const SIDEBAR_WIDTH_MOBILE = '15.25rem'
const SIDEBAR_WIDTH_ICON = '4.125rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarLabels = {
  toggle: string
  collapse?: string
  expand?: string
  overlayTitle: React.ReactNode
  overlayDescription: React.ReactNode
}

type SidebarContextProps = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  isTablet: boolean
  isOverlay: boolean
  viewport: SidebarViewport
  toggleSidebar: () => void
  labels: SidebarLabels
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
      )
    )
  )
}

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

type SidebarProviderProps = React.ComponentProps<'div'> & {
  labels: SidebarLabels
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  keyboardShortcut?: string | false
}

function SidebarProvider({
  labels,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  keyboardShortcut = SIDEBAR_KEYBOARD_SHORTCUT,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const { viewport, isMobile, isTablet, isOverlay } = useSidebarViewport()
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      if (setOpenProp) {
        const openState = typeof value === 'function' ? value(open) : value
        setOpenProp(openState)
        return
      }

      _setOpen(value)
    },
    [setOpenProp, open]
  )

  React.useEffect(() => {
    if (!isOverlay) setOpenMobile(false)
  }, [isOverlay])

  const toggleSidebar = React.useCallback(() => {
    return isOverlay ? setOpenMobile(open => !open) : setOpen(open => !open)
  }, [isOverlay, setOpen])

  React.useEffect(() => {
    if (!keyboardShortcut) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === keyboardShortcut.toLowerCase() &&
        (event.metaKey || event.ctrlKey) &&
        !event.defaultPrevented &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyboardShortcut, toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      isTablet,
      isOverlay,
      viewport,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      labels,
    }),
    [
      state,
      open,
      setOpen,
      isMobile,
      isTablet,
      isOverlay,
      viewport,
      openMobile,
      toggleSidebar,
      labels,
    ]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { isOverlay, state, openMobile, setOpenMobile, labels } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isOverlay) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className={cn(
            'w-(--sidebar-width)! max-w-(--sidebar-width)! bg-sidebar p-0 text-sidebar-foreground',
            className
          )}
          style={
            {
              '--sidebar-width': `min(${SIDEBAR_WIDTH_MOBILE}, calc(100vw - 2rem))`,
            } as React.CSSProperties
          }
          side={side}
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{labels.overlayTitle}</SheetTitle>
            <SheetDescription>{labels.overlayDescription}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground lg:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-[180ms] ease-standard motion-reduce:duration-0',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-[180ms] ease-standard motion-reduce:duration-0 data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] lg:flex',
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=left]:border-line group-data-[side=right]:border-l group-data-[side=right]:border-line',
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col overflow-hidden bg-sidebar group-data-[variant=floating]:rounded-2xl group-data-[variant=floating]:shadow-floating group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, labels } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      type="button"
      aria-label={labels.toggle}
      className={cn('lg:hidden', className)}
      onClick={event => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <Icon icon={SidebarLeftIcon} size={16} />
      <span className="sr-only">{labels.toggle}</span>
    </Button>
  )
}

function SidebarCollapseButton({
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'children' | 'size' | 'variant'>) {
  const { isOverlay, labels, state, toggleSidebar } = useSidebar()

  if (isOverlay) return null

  const label =
    state === 'collapsed'
      ? (labels.expand ?? labels.toggle)
      : (labels.collapse ?? labels.toggle)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className={cn('hidden lg:inline-flex', className)}
          onClick={event => {
            onClick?.(event)
            toggleSidebar()
          }}
        >
          <Icon
            icon={
              state === 'collapsed' ? ArrowRightDoubleIcon : ArrowLeftDoubleIcon
            }
            size={16}
          />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

type SidebarSearchButtonProps = Omit<
  SidebarMenuButtonProps,
  'children' | 'size' | 'tooltip' | 'variant'
> & {
  label: string
  shortcut?: readonly string[]
}

function SidebarSearchButton({
  'aria-label': ariaLabel,
  className,
  label,
  shortcut = ['Ctrl', 'K'],
  ...props
}: SidebarSearchButtonProps) {
  return (
    <SidebarMenuButton
      {...props}
      type="button"
      variant="outline"
      size="sm"
      tooltip={label}
      aria-label={ariaLabel ?? label}
      className={cn(
        'mt-2 mb-0 bg-surface text-text-faint hover:text-foreground',
        className
      )}
    >
      <Icon icon={SearchIcon} size={16} />
      <span className="min-w-0 flex-1 truncate text-left whitespace-nowrap">
        {label}
      </span>
      {shortcut.length > 0 ? (
        <KbdGroup className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden">
          {shortcut.map(key => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </KbdGroup>
      ) : null}
    </SidebarMenuButton>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar, labels, isOverlay } = useSidebar()

  if (isOverlay) return null

  return (
    <button
      type="button"
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={labels.toggle}
      tabIndex={-1}
      onClick={toggleSidebar}
      title={labels.toggle}
      className={cn(
        'absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'relative flex w-full flex-1 flex-col bg-background lg:peer-data-[variant=inset]:m-2 lg:peer-data-[variant=inset]:ml-0 lg:peer-data-[variant=inset]:rounded-xl lg:peer-data-[variant=inset]:shadow-sm lg:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn(
        'h-8 w-full border-control-border bg-table-head',
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        'flex flex-col px-2 pt-[9px] pb-0 after:mx-1.5 after:mt-2 after:h-px after:shrink-0 after:bg-separator',
        className
      )}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(
        'flex flex-col gap-px border-t border-separator px-2.5 pt-2 pb-2.5',
        className
      )}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('mx-0.5 my-1.5 w-auto bg-separator', className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'no-scrollbar scroll-fade-y scroll-fade-6 flex min-h-0 flex-1 flex-col gap-0 overflow-x-hidden overflow-y-auto group-data-[collapsible=icon]:scroll-fade-none group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        'relative flex w-full min-w-0 flex-col px-2.5 py-0',
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'flex h-auto shrink-0 items-center rounded-sm px-2 pt-[15px] pb-[5px] text-[10px] font-normal tracking-[0.02em] text-text-faint/75 ring-sidebar-ring outline-hidden transition-[height,padding,margin,opacity] duration-200 ease-disclosure group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-4 [&>svg]:shrink-0',
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'absolute top-[11px] right-4 flex aspect-square w-[22px] items-center justify-center rounded-sm p-0 text-text-meta ring-sidebar-ring outline-hidden transition-colors duration-150 ease-out group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:after:hidden [&>svg]:size-3.5 [&>svg]:shrink-0',
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-body', className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-px', className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  'peer/menu-button group/menu-button relative mb-px flex w-full items-center gap-2.5 overflow-hidden rounded-md border border-transparent px-[9px] text-left text-body font-normal text-text-secondary ring-sidebar-ring outline-hidden transition-[width,height,padding,background-color,color,border-color] duration-150 ease-out motion-reduce:duration-0 group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:[&_svg]:text-text-secondary group-data-[collapsible=icon]:[&>span:not([data-slot=sidebar-menu-identity-leading])]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:[&_svg]:text-primary [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:text-text-faint [&>span:last-child]:truncate',
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'border-sidebar-border bg-surface hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      },
      size: {
        default: 'h-[33px] text-body',
        sm: 'h-8 text-control',
        lg: 'h-11 text-body group-data-[collapsible=icon]:p-1!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type SidebarMenuButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>

type SidebarMenuIdentityProps = Omit<
  SidebarMenuButtonProps,
  'children' | 'size'
> & {
  description?: React.ReactNode
  interactive?: boolean
  label: React.ReactNode
  leading: React.ReactNode
  leadingVariant?: 'default' | 'brand'
  trailing?: React.ReactNode
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(function SidebarMenuButton(
  {
    asChild = false,
    isActive = false,
    variant = 'default',
    size = 'default',
    tooltip,
    className,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot.Root : 'button'
  const { isOverlay, state } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        isActive && 'group-data-[collapsible=icon]:[&_svg]:text-primary!',
        className
      )}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isOverlay}
        {...tooltip}
      />
    </Tooltip>
  )
})

const SidebarMenuIdentity = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuIdentityProps
>(function SidebarMenuIdentity(
  {
    className,
    description,
    interactive = true,
    label,
    leading,
    leadingVariant = 'default',
    trailing,
    ...props
  },
  ref
) {
  const identityClassName = cn(
    'mb-0 gap-[9px] rounded-lg px-2 data-[identity-variant=brand]:border-transparent data-[identity-variant=brand]:data-[state=open]:border-control-border data-[identity-variant=brand]:data-[state=open]:bg-switcher-hover data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-1!',
    className
  )
  const content = (
    <>
      <span
        data-slot="sidebar-menu-identity-leading"
        data-variant={leadingVariant}
        className={cn(
          'flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-md data-[variant=brand]:size-7 data-[variant=default]:size-[26px] group-data-[collapsible=icon]:size-7 [&>[data-slot=avatar]]:size-full',
          leadingVariant === 'brand' &&
            'bg-sidebar-primary text-sidebar-primary-foreground'
        )}
      >
        {leading}
      </span>
      <span
        data-slot="sidebar-menu-identity-copy"
        className="grid min-w-0 flex-1 gap-px text-left leading-tight"
      >
        <span className="truncate text-body font-semibold tracking-card-title">
          {label}
        </span>
        {description ? (
          <span className="truncate text-column text-text-meta">
            {description}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span
          data-slot="sidebar-menu-identity-trailing"
          className="ml-auto flex shrink-0 items-center text-text-meta group-data-[collapsible=icon]:hidden [&_svg]:size-3.5"
        >
          {trailing}
        </span>
      ) : null}
    </>
  )

  if (!interactive) {
    return (
      <div
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        data-size="lg"
        data-active="false"
        data-identity-variant={leadingVariant}
        className={cn(
          sidebarMenuButtonVariants({ size: 'lg' }),
          identityClassName,
          'cursor-default hover:bg-transparent hover:text-text-secondary'
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <SidebarMenuButton
      ref={ref}
      size="lg"
      data-identity-variant={leadingVariant}
      className={identityClassName}
      {...props}
    >
      {content}
    </SidebarMenuButton>
  )
})

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-sm p-0 text-text-meta ring-sidebar-ring outline-hidden transition-colors duration-150 ease-out group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-3 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 lg:opacity-0',
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'pointer-events-none absolute right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-separator px-1.5 text-eyebrow font-medium text-text-meta tabular-nums select-none group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-3 peer-data-[size=sm]/menu-button:top-1',
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean
}) {
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn(
        'flex h-[33px] items-center gap-2.5 rounded-md px-[9px]',
        className
      )}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-[18px] rounded-sm"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-3.5 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'ml-[13px] flex min-w-0 list-none flex-col gap-px pt-1 pl-2 group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative list-none', className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
  size?: 'sm' | 'md'
  isActive?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'a'

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'relative mb-px flex h-[33px] w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-md px-[9px] text-body text-text-secondary ring-sidebar-ring outline-hidden transition-colors duration-150 ease-out motion-reduce:duration-0 group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-[17px] [&>svg]:shrink-0 [&>svg]:text-text-faint data-active:[&_svg]:text-primary',
        className
      )}
      {...props}
    />
  )
}

export type {
  SidebarContextProps,
  SidebarLabels,
  SidebarMenuButtonProps,
  SidebarMenuIdentityProps,
  SidebarProviderProps,
  SidebarSearchButtonProps,
}
export {
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuIdentity,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSearchButton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
