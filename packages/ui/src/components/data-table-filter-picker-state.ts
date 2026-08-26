type ResetVisibleOptionsCallbacks = {
  clearOpenOption: () => void
  onReset?: () => void
  setVisibleOptionIds: (optionIds: string[]) => void
}

export function getDefaultVisibleOptionIds(
  defaultVisibleOptionIds: readonly string[]
) {
  return [...defaultVisibleOptionIds]
}

export function addVisibleOptionId(
  visibleOptionIds: readonly string[],
  optionId: string
) {
  return visibleOptionIds.includes(optionId)
    ? [...visibleOptionIds]
    : [...visibleOptionIds, optionId]
}

export function removeVisibleOptionId(
  visibleOptionIds: readonly string[],
  optionId: string
) {
  return visibleOptionIds.filter(id => id !== optionId)
}

export function hasRemovedDefaultOption(
  defaultVisibleOptionIds: readonly string[],
  visibleOptionIds: ReadonlySet<string>
) {
  return defaultVisibleOptionIds.some(
    optionId => !visibleOptionIds.has(optionId)
  )
}

export function resetVisibleOptions(
  defaultVisibleOptionIds: readonly string[],
  callbacks: ResetVisibleOptionsCallbacks
) {
  callbacks.setVisibleOptionIds(
    getDefaultVisibleOptionIds(defaultVisibleOptionIds)
  )
  callbacks.clearOpenOption()
  callbacks.onReset?.()
}
