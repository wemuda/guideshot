import { FileNotFoundIcon } from '@hugeicons/core-free-icons'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@guideshot/ui/components/empty'
import { Icon } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'

type StateProps = Omit<
  React.ComponentProps<typeof Empty>,
  'children' | 'title'
> & {
  action?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  title: React.ReactNode
}

type EmptyStateProps = StateProps
type ErrorStateProps = StateProps

type NotFoundStateProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  action?: React.ReactNode
  code?: React.ReactNode
  description?: React.ReactNode
  title: React.ReactNode
}

function StateContent({
  action,
  description,
  icon,
  title,
  mediaClassName,
  ...props
}: StateProps & { mediaClassName?: string }) {
  return (
    <Empty {...props}>
      <EmptyHeader>
        {icon && (
          <EmptyMedia variant="icon" className={mediaClassName}>
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

function EmptyState(props: EmptyStateProps) {
  return <StateContent data-slot="empty-state" {...props} />
}

function ErrorState({ role = 'alert', ...props }: ErrorStateProps) {
  return (
    <StateContent
      data-slot="error-state"
      role={role}
      mediaClassName="border border-destructive/30 bg-surface text-destructive"
      {...props}
    />
  )
}

function NotFoundState({
  action,
  className,
  code = '404',
  description,
  title,
  ...props
}: NotFoundStateProps) {
  const titleId = React.useId()
  const descriptionId = React.useId()

  return (
    <section
      data-slot="not-found-state"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'flex min-h-0 flex-1 items-center justify-center bg-background p-5 sm:p-8',
        className
      )}
      {...props}
    >
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-line bg-surface px-6 py-9 text-center sm:px-10 sm:py-11">
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-line bg-accent text-primary">
          <Icon icon={FileNotFoundIcon} size={24} />
        </div>
        <p className="font-mono text-caption font-medium tracking-[0.16em] text-primary uppercase">
          {code}
        </p>
        <h1
          id={titleId}
          className="mt-2 font-heading text-page-title font-semibold tracking-page-title text-foreground"
        >
          {title}
        </h1>
        {description && (
          <p
            id={descriptionId}
            className="mt-2 max-w-sm text-control text-text-secondary"
          >
            {description}
          </p>
        )}
        {action && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {action}
          </div>
        )}
      </div>
    </section>
  )
}

export type { EmptyStateProps, ErrorStateProps, NotFoundStateProps }
export { EmptyState, ErrorState, NotFoundState }
