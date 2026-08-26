import { SearchIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@guideshot/ui/components/dialog'
import { Icon } from '@guideshot/ui/components/icon'
import {
  InputGroup,
  InputGroupAddon,
} from '@guideshot/ui/components/input-group'
import { Spinner } from '@guideshot/ui/components/spinner'
import { cn } from '@guideshot/ui/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import * as React from 'react'

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex size-full min-h-0 flex-col overflow-hidden rounded-[inherit] bg-popover text-popover-foreground',
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  shouldFilter,
  disablePointerSelection,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  shouldFilter?: boolean
  disablePointerSelection?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        overlayClassName="bg-transparent supports-backdrop-filter:backdrop-blur-none"
        className={cn(
          'top-[15%] h-[min(32rem,calc(100dvh-2rem))] min-h-80 translate-y-0 gap-0 overflow-hidden rounded-2xl! border bg-popover p-0 shadow-floating ring-4 ring-muted sm:max-w-[640px]',
          className
        )}
        {...(showCloseButton
          ? { showCloseButton: true, closeLabel: 'Close command palette' }
          : { showCloseButton: false })}
      >
        <Command
          shouldFilter={shouldFilter}
          disablePointerSelection={disablePointerSelection}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  isSearching = false,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  isSearching?: boolean
}) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="in-data-[slot=dialog-content]:p-2"
    >
      <InputGroup className="h-10! rounded-none border-0 border-b border-separator bg-surface px-3 ring-0 focus-within:ring-0 in-data-[slot=dialog-content]:h-11! in-data-[slot=dialog-content]:rounded-lg in-data-[slot=dialog-content]:border in-data-[slot=dialog-content]:border-control-border in-data-[slot=dialog-content]:bg-muted/60 in-data-[slot=dialog-content]:px-3">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            'min-w-0 flex-1 text-body outline-hidden placeholder:text-text-meta disabled:cursor-not-allowed disabled:opacity-50 in-data-[slot=dialog-content]:text-control',
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          {isSearching ? (
            <Spinner size={16} className="opacity-75" />
          ) : (
            <Icon icon={SearchIcon} size={16} className="shrink-0 opacity-50" />
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'no-scrollbar scroll-fade-y scroll-fade-6 max-h-80 scroll-py-1 overflow-x-hidden overflow-y-auto p-1 outline-none in-data-[slot=dialog-content]:max-h-none in-data-[slot=dialog-content]:flex-1 in-data-[slot=dialog-content]:px-2 in-data-[slot=dialog-content]:pb-2',
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('py-8 text-center text-control text-text-meta', className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'overflow-hidden py-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-control **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-text-meta in-data-[slot=dialog-content]:**:[[cmdk-group-heading]]:px-3 in-data-[slot=dialog-content]:**:[[cmdk-group-heading]]:pt-2.5 in-data-[slot=dialog-content]:**:[[cmdk-group-heading]]:pb-1',
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-[5px] my-1 h-px bg-separator', className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex min-h-9 cursor-default items-center gap-2.5 rounded-md border border-transparent px-2.5 py-1.5 text-control outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-accent data-selected:text-foreground in-data-[slot=dialog-content]:min-h-10 in-data-[slot=dialog-content]:rounded-lg in-data-[slot=dialog-content]:px-3 in-data-[slot=dialog-content]:data-selected:border-control-border in-data-[slot=dialog-content]:data-selected:bg-muted/70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <Icon
        icon={Tick02Icon}
        size={12}
        className="ml-auto hidden group-data-[checked=true]/command-item:block group-has-data-[slot=command-shortcut]/command-item:hidden"
      />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'ml-auto font-mono text-eyebrow text-text-meta group-data-selected/command-item:text-foreground',
        className
      )}
      {...props}
    />
  )
}

function CommandFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        'mt-auto flex min-h-11 w-full shrink-0 items-center gap-4 border-t border-separator bg-muted/35 px-4 py-2 text-control text-text-meta',
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
