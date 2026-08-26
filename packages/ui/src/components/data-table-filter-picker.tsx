'use client'

import {
  Cancel01Icon,
  FilterIcon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons'
import { Button } from '@guideshot/ui/components/button'
import { Icon, type IconData } from '@guideshot/ui/components/icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@guideshot/ui/components/popover'
import * as React from 'react'
import {
  addVisibleOptionId,
  getDefaultVisibleOptionIds,
  hasRemovedDefaultOption,
  removeVisibleOptionId,
  resetVisibleOptions,
} from './data-table-filter-picker-state'

type DataTableFilterOption = {
  id: string
  label: string
  icon?: IconData
  active?: boolean
  onAdd?: () => void
  onRemove?: () => void
  removeLabel?: string
  renderControl: (props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    triggerClassName?: string
  }) => React.ReactNode
}

type DataTableFilterPickerProps = {
  options: DataTableFilterOption[]
  addFilterLabel: string
  defaultVisibleOptionIds?: string[]
  resetFiltersLabel: string
  onResetFilters?: () => void
}

function DataTableFilterPicker({
  options,
  addFilterLabel,
  defaultVisibleOptionIds = [],
  resetFiltersLabel,
  onResetFilters,
}: DataTableFilterPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [addedFilterIds, setAddedFilterIds] = React.useState<string[]>(() =>
    getDefaultVisibleOptionIds(defaultVisibleOptionIds)
  )
  const [openFilterId, setOpenFilterId] = React.useState<string>()
  const pendingFilterId = React.useRef<string | undefined>(undefined)
  const visibleFilterIds = new Set([
    ...addedFilterIds,
    ...options.filter(option => option.active).map(option => option.id),
  ])
  const visibleOptions = options.filter(option =>
    visibleFilterIds.has(option.id)
  )
  const availableOptions = options.filter(
    option => !visibleFilterIds.has(option.id)
  )
  const hasRemovedDefault = hasRemovedDefaultOption(
    defaultVisibleOptionIds,
    visibleFilterIds
  )

  function addFilter(option: DataTableFilterOption) {
    setAddedFilterIds(current => addVisibleOptionId(current, option.id))
    option.onAdd?.()
    pendingFilterId.current = option.id
    setOpen(false)
  }

  function handlePickerCloseAutoFocus(event: Event) {
    const filterId = pendingFilterId.current
    if (!filterId) return

    event.preventDefault()
    pendingFilterId.current = undefined
    requestAnimationFrame(() => setOpenFilterId(filterId))
  }

  function removeFilter(option: DataTableFilterOption) {
    setAddedFilterIds(current => removeVisibleOptionId(current, option.id))
    if (openFilterId === option.id) setOpenFilterId(undefined)
    option.onRemove?.()
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {visibleOptions.map(option => (
        <div key={option.id} className="flex min-w-0 max-w-full items-stretch">
          {option.renderControl({
            open: openFilterId === option.id,
            onOpenChange: nextOpen =>
              setOpenFilterId(nextOpen ? option.id : undefined),
            triggerClassName: option.onRemove ? 'rounded-r-none' : undefined,
          })}
          {option.onRemove ? (
            <Button
              type="button"
              variant={option.active ? 'default' : 'outline'}
              size="icon-sm"
              className="-ml-px shrink-0 rounded-l-none"
              aria-label={option.removeLabel ?? option.label}
              onClick={() => removeFilter(option)}
            >
              <Icon icon={Cancel01Icon} />
            </Button>
          ) : null}
        </div>
      ))}
      {availableOptions.length > 0 ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Icon icon={FilterIcon} data-icon="inline-start" />
              {addFilterLabel}
              <Icon icon={PlusSignIcon} data-icon="inline-end" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-64 p-1.5"
            onCloseAutoFocus={handlePickerCloseAutoFocus}
          >
            <div className="grid gap-0.5">
              {availableOptions.map(option => (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addFilter(option)}
                >
                  {option.icon ? (
                    <Icon icon={option.icon} data-icon="inline-start" />
                  ) : null}
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
      {visibleOptions.length > 0 || hasRemovedDefault ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            resetVisibleOptions(defaultVisibleOptionIds, {
              clearOpenOption: () => setOpenFilterId(undefined),
              onReset: onResetFilters,
              setVisibleOptionIds: setAddedFilterIds,
            })
          }}
        >
          {resetFiltersLabel}
        </Button>
      ) : null}
    </div>
  )
}

export type { DataTableFilterOption, DataTableFilterPickerProps }
export { DataTableFilterPicker }
