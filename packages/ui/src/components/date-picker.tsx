'use client'

import { ArrowDown01Icon, Calendar03Icon } from '@hugeicons/core-free-icons'
import { Button, type ButtonProps } from '@guideshot/ui/components/button'
import { Calendar } from '@guideshot/ui/components/calendar'
import { Icon } from '@guideshot/ui/components/icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@guideshot/ui/components/popover'
import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'
import type { DateRange, Locale, Matcher } from 'react-day-picker'

type DatePickerBaseProps = Omit<ButtonProps, 'children' | 'value'> & {
  clearLabel?: string
  formatDate?: (date: Date) => React.ReactNode
  locale?: Partial<Locale>
  maxDate?: Date
  minDate?: Date
  placeholder: React.ReactNode
  popoverClassName?: string
}

type DatePickerProps = DatePickerBaseProps & {
  onValueChange?: (value: Date | undefined) => void
  value?: Date
}

type DateRangePickerProps = DatePickerBaseProps & {
  formatRange?: (value: DateRange) => React.ReactNode
  onValueChange?: (value: DateRange | undefined) => void
  value?: DateRange
}

function getDisabledMatchers(minDate?: Date, maxDate?: Date): Matcher[] {
  const disabled: Matcher[] = []
  if (minDate) disabled.push({ before: minDate })
  if (maxDate) disabled.push({ after: maxDate })
  return disabled
}

function defaultFormatDate(date: Date, locale?: Partial<Locale>) {
  return new Intl.DateTimeFormat(locale?.code, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function DatePicker({
  className,
  clearLabel,
  formatDate,
  locale,
  maxDate,
  minDate,
  onValueChange,
  placeholder,
  popoverClassName,
  value,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const formattedValue = value
    ? (formatDate?.(value) ?? defaultFormatDate(value, locale))
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-text-meta',
            className
          )}
          {...props}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon icon={Calendar03Icon} size={16} />
            <span className="truncate">{formattedValue}</span>
          </span>
          <Icon icon={ArrowDown01Icon} size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn('w-auto p-0', popoverClassName)}
      >
        <Calendar
          mode="single"
          locale={locale}
          defaultMonth={value}
          startMonth={minDate}
          endMonth={maxDate}
          selected={value}
          disabled={getDisabledMatchers(minDate, maxDate)}
          onSelect={nextValue => {
            onValueChange?.(nextValue)
            if (nextValue) setOpen(false)
          }}
        />
        {clearLabel && value && (
          <div className="border-t border-border p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                onValueChange?.(undefined)
                setOpen(false)
              }}
            >
              {clearLabel}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function DateRangePicker({
  className,
  clearLabel,
  formatDate,
  formatRange,
  locale,
  maxDate,
  minDate,
  onValueChange,
  placeholder,
  popoverClassName,
  value,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const format = React.useCallback(
    (date: Date) => formatDate?.(date) ?? defaultFormatDate(date, locale),
    [formatDate, locale]
  )
  const formattedValue = value?.from
    ? (formatRange?.(value) ??
      (value.to ? (
        <>
          {format(value.from)} – {format(value.to)}
        </>
      ) : (
        <>{format(value.from)} – …</>
      )))
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between font-normal',
            !value?.from && 'text-text-meta',
            className
          )}
          {...props}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon icon={Calendar03Icon} size={16} />
            <span className="truncate">{formattedValue}</span>
          </span>
          <Icon icon={ArrowDown01Icon} size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn('w-auto p-0', popoverClassName)}
      >
        <Calendar
          mode="range"
          locale={locale}
          defaultMonth={value?.from}
          startMonth={minDate}
          endMonth={maxDate}
          selected={value}
          disabled={getDisabledMatchers(minDate, maxDate)}
          onSelect={nextValue => {
            onValueChange?.(nextValue)
            if (nextValue?.from && nextValue.to) setOpen(false)
          }}
        />
        {clearLabel && value?.from && (
          <div className="border-t border-border p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                onValueChange?.(undefined)
                setOpen(false)
              }}
            >
              {clearLabel}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export type { DatePickerProps, DateRangePickerProps }
export { DatePicker, DateRangePicker }
