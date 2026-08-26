import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import * as React from 'react'

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-lg border border-card-border bg-surface',
        className
      )}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'not-last:border-b not-last:border-separator data-open:bg-table',
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex min-h-10 flex-1 items-center justify-between gap-6 border border-transparent px-3 py-2 text-left text-body font-medium transition-colors duration-150 ease-out outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:text-text-meta',
          className
        )}
        {...props}
      >
        {children}
        <Icon
          icon={ArrowDown01Icon}
          size={16}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <Icon
          icon={ArrowUp01Icon}
          size={16}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden px-3 text-caption text-text-secondary data-open:animate-accordion-down data-closed:animate-accordion-up motion-reduce:animate-none"
      {...props}
    >
      <div
        className={cn(
          'h-(--radix-accordion-content-height) pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
