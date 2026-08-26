import { Badge } from '@guideshot/ui/components/badge'
import { cn } from '@guideshot/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const statusBadgeVariants = cva('font-medium', {
  variants: {
    tone: {
      neutral: 'border-border text-text-secondary',
      info: 'border-info/30 text-info',
      success: 'border-success/30 text-success',
      warning: 'border-warning/30 text-warning',
      destructive: 'border-destructive/30 text-destructive',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

type StatusBadgeTone = NonNullable<
  VariantProps<typeof statusBadgeVariants>['tone']
>

type StatusBadgeProps = Omit<
  React.ComponentProps<typeof Badge>,
  'asChild' | 'variant'
> &
  VariantProps<typeof statusBadgeVariants> & {
    children: React.ReactNode
  }

function StatusBadge({
  children,
  className,
  tone = 'neutral',
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-slot="status-badge"
      data-tone={tone}
      className={cn(statusBadgeVariants({ tone }), className)}
      {...props}
    >
      {children}
    </Badge>
  )
}

export type { StatusBadgeProps, StatusBadgeTone }
export { StatusBadge }
