import { describe, expect, it, vi } from 'vitest'
import {
  getDefaultVisibleOptionIds,
  hasRemovedDefaultOption,
  removeVisibleOptionId,
  resetVisibleOptions,
} from './data-table-filter-picker-state'

describe('default-visible data-table filters', () => {
  it('keeps reset available after removal and restores the defaults', () => {
    const defaults = ['status']
    const initial = getDefaultVisibleOptionIds(defaults)
    const removed = removeVisibleOptionId(initial, 'status')
    const setVisibleOptionIds = vi.fn()
    const clearOpenOption = vi.fn()
    const onReset = vi.fn()

    expect(initial).toEqual(['status'])
    expect(removed).toEqual([])
    expect(hasRemovedDefaultOption(defaults, new Set(removed))).toBe(true)

    resetVisibleOptions(defaults, {
      clearOpenOption,
      onReset,
      setVisibleOptionIds,
    })

    expect(setVisibleOptionIds).toHaveBeenCalledWith(['status'])
    expect(clearOpenOption).toHaveBeenCalledOnce()
    expect(onReset).toHaveBeenCalledOnce()
  })
})
