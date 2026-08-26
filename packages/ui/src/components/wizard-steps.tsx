import { ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { Button } from '@guideshot/ui/components/button'
import { Icon } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { KeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const RAIL_TRANSITION = {
  type: 'spring',
  stiffness: 520,
  damping: 40,
  mass: 0.5,
} as const

const PANEL_TRANSITION = {
  type: 'spring',
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const

type WizardDirection = 1 | -1

interface UseWizardOptions {
  total: number
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number, direction: WizardDirection) => void
}

function clampIndex(value: number, total: number) {
  if (total < 1) return 0
  return Math.max(0, Math.min(total - 1, Math.trunc(value)))
}

function useWizard({
  total,
  index,
  defaultIndex = 0,
  onIndexChange,
}: UseWizardOptions) {
  const [internalIndex, setInternalIndex] = useState(() =>
    clampIndex(defaultIndex, total)
  )
  const currentIndex = clampIndex(index ?? internalIndex, total)
  const [position, setPosition] = useState({
    index: currentIndex,
    direction: 1 as WizardDirection,
  })
  const [furthest, setFurthest] = useState(currentIndex)
  const emitIndexChange = useRef(onIndexChange)

  emitIndexChange.current = onIndexChange

  if (position.index !== currentIndex) {
    setPosition({
      index: currentIndex,
      direction: currentIndex > position.index ? 1 : -1,
    })
  }

  if (furthest < currentIndex) setFurthest(currentIndex)

  const goTo = useCallback(
    (nextIndex: number) => {
      const target = clampIndex(nextIndex, total)
      if (target === currentIndex) return
      const direction: WizardDirection = target > currentIndex ? 1 : -1
      if (index === undefined) setInternalIndex(target)
      emitIndexChange.current?.(target, direction)
    },
    [currentIndex, index, total]
  )

  return {
    index: currentIndex,
    direction: position.direction,
    furthest: Math.min(furthest, Math.max(total - 1, 0)),
    goTo,
  }
}

interface WizardStep {
  id: string
  label: string
  content: ReactNode
  hideNavigation?: boolean
}

interface WizardStepsProps {
  steps: WizardStep[]
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number, direction: WizardDirection) => void
  onBeforeAdvance?: (index: number) => boolean | Promise<boolean>
  onComplete?: () => void
  height?: number
  backLabel: string
  nextLabel: string
  finishLabel: string
  label: string
  completed?: boolean
  completedLabel?: string
  completedContent?: ReactNode
  canAdvance?: boolean
  busy?: boolean
  busyContent?: ReactNode
  className?: string
}

function WizardSteps({
  steps,
  index,
  defaultIndex = 0,
  onIndexChange,
  onBeforeAdvance,
  onComplete,
  height = 320,
  backLabel,
  nextLabel,
  finishLabel,
  label,
  completed = false,
  completedLabel,
  completedContent,
  canAdvance = true,
  busy = false,
  busyContent,
  className,
}: WizardStepsProps) {
  const wizard = useWizard({
    total: steps.length,
    index,
    defaultIndex,
    onIndexChange,
  })
  const reducedMotion = useReducedMotion()
  const stepListRef = useRef<HTMLOListElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const focusTarget = useRef<'step' | 'panel' | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const { index: activeIndex, direction, furthest, goTo } = wizard
  const activeStep = steps[activeIndex]
  const isFirst = activeIndex === 0
  const isLast = activeIndex === steps.length - 1

  useEffect(() => {
    const target = focusTarget.current ?? 'panel'
    focusTarget.current = null
    if (target === 'step') {
      stepListRef.current
        ?.querySelector<HTMLButtonElement>('button[data-current="true"]')
        ?.focus()
      return
    }
    viewportRef.current?.focus({ preventScroll: true })
  }, [activeIndex, completed])

  const variants = useMemo(
    () => ({
      enter: (value: WizardDirection) =>
        reducedMotion ? { opacity: 0 } : { opacity: 0, x: value * 22 },
      center: { opacity: 1, x: 0 },
      exit: (value: WizardDirection) =>
        reducedMotion
          ? { opacity: 0, transition: { duration: 0 } }
          : {
              opacity: 0,
              x: value * -22,
              transition: { duration: 0.14, ease: [0.4, 0, 1, 1] as const },
            },
    }),
    [reducedMotion]
  )

  if (!activeStep) return null

  const position = completed
    ? (completedLabel ?? activeStep.label)
    : `${activeIndex + 1} / ${steps.length}: ${activeStep.label}`

  const handleStepKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    let target = activeIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      target = activeIndex + 1
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      target = activeIndex - 1
    } else if (event.key === 'Home') {
      target = 0
    } else if (event.key === 'End') {
      target = furthest
    } else {
      return
    }

    event.preventDefault()
    target = Math.min(clampIndex(target, steps.length), furthest)
    if (target === activeIndex) return
    focusTarget.current = 'step'
    goTo(target)
  }

  const advance = async () => {
    setIsAdvancing(true)
    const canAdvance = (await onBeforeAdvance?.(activeIndex)) ?? true
    setIsAdvancing(false)
    if (!canAdvance) return
    if (isLast) {
      onComplete?.()
      return
    }
    focusTarget.current = 'panel'
    goTo(activeIndex + 1)
  }

  return (
    <div className={cn('w-full', className)}>
      <p aria-live="polite" className="sr-only">
        {position}
      </p>
      <div
        aria-hidden
        className="mb-2 grid select-none font-medium text-control"
      >
        {steps.map((step, stepIndex) => (
          <motion.span
            key={step.id}
            className="col-start-1 row-start-1 truncate"
            initial={false}
            animate={{
              opacity: !completed && stepIndex === activeIndex ? 1 : 0,
            }}
            transition={reducedMotion ? { duration: 0 } : PANEL_TRANSITION}
          >
            {step.label}
          </motion.span>
        ))}
        {completed ? (
          <motion.span
            className="col-start-1 row-start-1 truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : PANEL_TRANSITION}
          >
            {completedLabel}
          </motion.span>
        ) : null}
      </div>
      <ol
        ref={stepListRef}
        aria-label={label}
        className="mb-4 flex list-none items-center gap-1 p-0"
      >
        {steps.map((step, stepIndex) => {
          const complete = completed || stepIndex < activeIndex
          const current = !completed && stepIndex === activeIndex
          const marker = (
            <motion.span
              aria-hidden
              className={cn(
                'grid size-7 place-items-center rounded-md border text-caption font-medium tabular-nums transition-colors duration-150 motion-reduce:transition-none',
                complete && 'border-primary bg-primary text-primary-foreground',
                current && 'border-primary bg-surface text-primary',
                !complete &&
                  !current &&
                  'border-control-border bg-surface text-text-meta'
              )}
              initial={false}
              animate={{ scale: current ? 1 : 0.92 }}
              transition={reducedMotion ? { duration: 0 } : RAIL_TRANSITION}
            >
              {complete ? <Icon icon={Tick02Icon} size={12} /> : stepIndex + 1}
            </motion.span>
          )

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center gap-1 last:flex-none"
            >
              {!completed && stepIndex <= furthest ? (
                <button
                  type="button"
                  data-current={current ? 'true' : undefined}
                  tabIndex={current ? 0 : -1}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`${stepIndex + 1} / ${steps.length}: ${step.label}`}
                  onKeyDown={handleStepKeyDown}
                  onClick={() => {
                    if (current) return
                    focusTarget.current = 'step'
                    goTo(stepIndex)
                  }}
                  className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {marker}
                </button>
              ) : (
                <span>{marker}</span>
              )}
              {stepIndex < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-muted"
                >
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-primary"
                    initial={false}
                    animate={{
                      scaleX: completed || stepIndex < activeIndex ? 1 : 0,
                    }}
                    transition={
                      reducedMotion ? { duration: 0 } : RAIL_TRANSITION
                    }
                  />
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
      <div
        ref={viewportRef}
        tabIndex={-1}
        role="group"
        aria-label={position}
        style={{ height }}
        className="relative overflow-hidden border-y border-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={completed ? 'wizard-completed' : activeStep.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reducedMotion ? { duration: 0 } : PANEL_TRANSITION}
            className="absolute inset-0 overflow-y-auto overscroll-contain py-4"
          >
            {completed ? completedContent : activeStep.content}
          </motion.div>
        </AnimatePresence>
      </div>
      {!completed && !activeStep.hideNavigation ? (
        <div className="mt-3 flex h-8 items-center gap-2">
          {!isFirst ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy || isAdvancing}
              onClick={() => {
                focusTarget.current = 'panel'
                goTo(activeIndex - 1)
              }}
            >
              {backLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            className="ml-auto"
            disabled={busy || isAdvancing || !canAdvance}
            aria-busy={busy || isAdvancing}
            onClick={advance}
          >
            {busy && isLast && busyContent ? busyContent : null}
            {isLast ? finishLabel : nextLabel}
            {!busy || !isLast ? (
              <Icon icon={isLast ? Tick02Icon : ArrowRight01Icon} size={16} />
            ) : null}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export type { WizardDirection, WizardStep, WizardStepsProps }
export { WizardSteps }
