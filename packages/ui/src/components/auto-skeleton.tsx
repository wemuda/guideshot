import type { PhantomUiAttributes } from '@aejkatappaja/phantom-ui'
import '@aejkatappaja/phantom-ui'
import * as React from 'react'

type AutoSkeletonVariant = 'initial' | 'refresh'

type AutoSkeletonProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'aria-busy' | 'aria-label' | 'children'
> & {
  children: React.ReactNode
  debug?: boolean
  label: string
  loading: boolean
  repeat?: number
  repeatGap?: number
  template?: React.ReactNode
  variant?: AutoSkeletonVariant
}

type PhantomElementProps = Omit<
  PhantomUiAttributes,
  'children' | 'class' | 'ref' | 'style'
> &
  Omit<
    React.HTMLAttributes<HTMLElement>,
    'aria-busy' | 'aria-label' | 'children' | 'className'
  > & {
    children: React.ReactNode
    class?: string
    ref?: React.ForwardedRef<HTMLElement>
    style?: React.CSSProperties
  }

const PhantomElement =
  'phantom-ui' as unknown as React.ElementType<PhantomElementProps>

const AutoSkeleton = React.forwardRef<HTMLElement, AutoSkeletonProps>(
  function AutoSkeleton(
    {
      children,
      className,
      debug = false,
      label,
      loading,
      repeat = 1,
      repeatGap = 0,
      style,
      template,
      variant = 'initial',
      ...props
    },
    ref
  ) {
    const mode = variant === 'refresh' ? 'overlay' : 'skeleton'
    const repeatCount = Number.isFinite(repeat)
      ? Math.max(1, Math.round(repeat))
      : 1
    const repeatSpacing = Number.isFinite(repeatGap)
      ? Math.max(0, repeatGap)
      : 0
    const content =
      loading && mode === 'skeleton' && template !== undefined
        ? template
        : children

    return (
      <PhantomElement
        {...props}
        ref={ref}
        data-slot="auto-skeleton"
        loading={loading}
        loading-label={label}
        mode={mode}
        animation="shimmer"
        shimmer-direction="ltr"
        shimmer-color="var(--canvas)"
        background-color={mode === 'skeleton' ? 'var(--muted)' : 'transparent'}
        duration={1.6}
        fallback-radius={6}
        count={mode === 'skeleton' ? repeatCount : 1}
        count-gap={mode === 'skeleton' ? repeatSpacing : 0}
        debug={debug || undefined}
        class={className}
        // `phantom-ui` declares `:host { overflow: hidden }`. That clipping is not load-bearing
        // — the shimmer lives in `.shimmer-overlay`, which clips itself — but on the host it
        // does two things: it hides any content taller than the host, and it zeroes the host's
        // automatic minimum size, so as a flex child of `PageContent` the element shrinks to
        // the viewport instead of growing with its content. A page whose content overflows then
        // cannot be scrolled at all — 124 test groups rendered, 11 reachable. Inline, because a
        // Tailwind utility sits in `@layer utilities` and an unlayered `:host` rule outranks it.
        style={{ overflow: 'visible', ...style }}
      >
        {content}
      </PhantomElement>
    )
  }
)

export type { AutoSkeletonProps, AutoSkeletonVariant }
export { AutoSkeleton }
