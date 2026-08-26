import { cn } from '@guideshot/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-eyebrow font-medium whitespace-nowrap transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive [&>svg]:pointer-events-none [&>svg]:size-2.5!',
  {
    variants: {
      variant: {
        default:
          'border-primary/15 bg-primary-soft text-primary [a]:hover:border-primary/25',
        secondary:
          'border-border bg-muted text-text-secondary [a]:hover:bg-accent',
        destructive:
          'border-destructive/30 bg-[color-mix(in_oklab,currentColor_10%,var(--surface))] text-destructive focus-visible:ring-destructive [a]:hover:bg-destructive/15',
        outline:
          'border-border bg-[color-mix(in_oklab,currentColor_10%,var(--surface))] text-text-secondary [a]:hover:bg-accent',
        ghost: 'text-text-secondary hover:bg-accent hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
