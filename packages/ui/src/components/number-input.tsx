import { Input } from '@guideshot/ui/components/input'
import * as React from 'react'

type NumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'inputMode' | 'onChange' | 'type' | 'value'
> & {
  decimalSeparator?: ',' | '.'
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onCommit?: (value: number | undefined) => void
  onValueChange?: (value: number | undefined) => void
  value?: number
}

function formatValue(value: number, decimalSeparator: ',' | '.') {
  const formatted = String(value)
  return decimalSeparator === ',' ? formatted.replace('.', ',') : formatted
}

function parseValue(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (normalized === '' || normalized === '-') return undefined

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function NumberInput({
  decimalSeparator = ',',
  onBlur,
  onChange,
  onCommit,
  onFocus,
  onValueChange,
  value,
  ...props
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() =>
    value === undefined || !Number.isFinite(value)
      ? ''
      : formatValue(value, decimalSeparator)
  )
  const isFocused = React.useRef(false)

  React.useEffect(() => {
    if (isFocused.current) return
    setDisplayValue(
      value === undefined || !Number.isFinite(value)
        ? ''
        : formatValue(value, decimalSeparator)
    )
  }, [decimalSeparator, value])

  const commit = React.useCallback(
    (nextDisplayValue: string) => {
      const nextValue = parseValue(nextDisplayValue)
      const formatted =
        nextValue === undefined ? '' : formatValue(nextValue, decimalSeparator)
      setDisplayValue(formatted)
      onValueChange?.(nextValue)
      onCommit?.(nextValue)
    },
    [decimalSeparator, onCommit, onValueChange]
  )

  return (
    <Input
      {...props}
      inputMode="decimal"
      value={displayValue}
      onFocus={event => {
        isFocused.current = true
        onFocus?.(event)
      }}
      onBlur={event => {
        isFocused.current = false
        commit(displayValue)
        onBlur?.(event)
      }}
      onChange={event => {
        const normalized = event.target.value.replace(/\./g, decimalSeparator)
        setDisplayValue(normalized)
        onChange?.(event)

        if (normalized === '' || normalized === '-') {
          onValueChange?.(undefined)
          return
        }
        if (normalized.endsWith(decimalSeparator)) return

        const nextValue = parseValue(normalized)
        if (nextValue !== undefined) onValueChange?.(nextValue)
      }}
      onKeyDown={event => {
        props.onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          [
            'Backspace',
            'Delete',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'Enter',
          ].includes(event.key)
        ) {
          return
        }

        const current = event.currentTarget.value
        const selectionStart =
          event.currentTarget.selectionStart ?? current.length
        if (event.key === '-') {
          if (selectionStart !== 0 || current.includes('-')) {
            event.preventDefault()
          }
          return
        }
        if (event.key === ',' || event.key === '.') {
          if (current.includes(',') || current.includes('.')) {
            event.preventDefault()
          }
          return
        }
        if (event.key.length === 1 && !/\d/.test(event.key)) {
          event.preventDefault()
        }
      }}
      onPaste={event => {
        props.onPaste?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        commit(event.clipboardData.getData('text'))
      }}
    />
  )
}

export type { NumberInputProps }
export { NumberInput }
