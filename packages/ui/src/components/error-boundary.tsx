'use client'

import * as React from 'react'

export interface ErrorBoundaryFallbackProps {
  error: unknown
  /** Clears the caught error and re-renders the children. */
  reset: () => void
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** What to show instead of the children. The application owns the copy and the actions. */
  fallback: (props: ErrorBoundaryFallbackProps) => React.ReactNode
  /**
   * Changing this clears a caught error. Pass the route path: a page that threw must not keep
   * throwing after the operator navigates somewhere else, which is what makes a boundary feel
   * like a crash rather than a recovery.
   */
  resetKey?: unknown
  /** Somewhere to report the error — a logger, Sentry, a toast. */
  onError?: (error: unknown, info: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: unknown
}

/**
 * Keeps one broken subtree from taking the whole app down.
 *
 * Without a boundary anywhere in the tree, an uncaught render error unmounts everything —
 * shell, navigation, session — leaving a blank page whose only recovery is a manual reload.
 * The realistic trigger is not exotic: a screen rendering payloads written by different
 * producers over months will eventually meet a shape it was not written for.
 *
 * Mechanism only, per the shared-component contract: no copy, no error rendering, no retry
 * or routing decisions. Those differ by application — an internal tool wants the stack trace
 * on screen, a customer-facing app wants translated reassurance and none of it — so the
 * `fallback` belongs to the consumer.
 *
 * Deliberately a class component. React exposes error catching only through
 * `getDerivedStateFromError` / `componentDidCatch`, and no hook equivalent exists.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.reset()
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return this.props.fallback({ error, reset: this.reset })
  }
}
