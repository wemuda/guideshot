'use client'

import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Icon, type IconData } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import * as React from 'react'

type TreeNode = {
  id: string
  label: React.ReactNode
  textValue?: string
  meta?: React.ReactNode
  icon?: IconData
  children?: TreeNode[]
}

type TreeViewProps = Omit<React.ComponentProps<'div'>, 'onSelect'> & {
  nodes: TreeNode[]
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  selected?: string
  defaultSelected?: string
  onSelectedChange?: (selected: string) => void
}

type VisibleTreeNode = {
  node: TreeNode
  depth: number
  parentId?: string
}

function TreeView({
  nodes,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  selected,
  defaultSelected,
  onSelectedChange,
  className,
  ...props
}: TreeViewProps) {
  const reduceMotion = useReducedMotion()
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpanded)
  const [internalSelected, setInternalSelected] =
    React.useState(defaultSelected)
  const [focusedId, setFocusedId] = React.useState(
    selected ?? defaultSelected ?? nodes[0]?.id
  )
  const rowRefs = React.useRef(new Map<string, HTMLDivElement>())
  const typeahead = React.useRef('')
  const typeaheadTimeout = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)

  const activeExpanded = expanded ?? internalExpanded
  const activeSelected = selected ?? internalSelected
  const visibleNodes = React.useMemo(
    () => flattenVisibleNodes(nodes, new Set(activeExpanded)),
    [activeExpanded, nodes]
  )

  React.useEffect(() => {
    return () => {
      if (typeaheadTimeout.current) clearTimeout(typeaheadTimeout.current)
    }
  }, [])

  React.useEffect(() => {
    if (focusedId && visibleNodes.some(item => item.node.id === focusedId)) {
      return
    }
    setFocusedId(activeSelected ?? visibleNodes[0]?.node.id)
  }, [activeSelected, focusedId, visibleNodes])

  function updateExpanded(next: string[]) {
    if (expanded === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  function toggleExpanded(id: string, force?: boolean) {
    const next = new Set(activeExpanded)
    const shouldExpand = force ?? !next.has(id)
    if (shouldExpand) next.add(id)
    else next.delete(id)
    updateExpanded([...next])
  }

  function selectNode(id: string) {
    if (selected === undefined) setInternalSelected(id)
    setFocusedId(id)
    onSelectedChange?.(id)
  }

  function focusNode(id?: string) {
    if (!id) return
    setFocusedId(id)
    requestAnimationFrame(() => rowRefs.current.get(id)?.focus())
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    item: VisibleTreeNode
  ) {
    const index = visibleNodes.findIndex(
      entry => entry.node.id === item.node.id
    )
    const hasChildren = Boolean(item.node.children?.length)
    const isExpanded = activeExpanded.includes(item.node.id)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusNode(visibleNodes[index + 1]?.node.id)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusNode(visibleNodes[index - 1]?.node.id)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusNode(visibleNodes[0]?.node.id)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusNode(visibleNodes.at(-1)?.node.id)
      return
    }
    if (event.key === 'ArrowRight' && hasChildren) {
      event.preventDefault()
      if (!isExpanded) toggleExpanded(item.node.id, true)
      else focusNode(item.node.children?.[0]?.id)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (hasChildren && isExpanded) toggleExpanded(item.node.id, false)
      else focusNode(item.parentId)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectNode(item.node.id)
      if (hasChildren) toggleExpanded(item.node.id)
      return
    }
    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return
    }

    typeahead.current += event.key.toLocaleLowerCase()
    if (typeaheadTimeout.current) clearTimeout(typeaheadTimeout.current)
    typeaheadTimeout.current = setTimeout(() => {
      typeahead.current = ''
    }, 500)
    const candidates = [
      ...visibleNodes.slice(index + 1),
      ...visibleNodes.slice(0, index + 1),
    ]
    const match = candidates.find(candidate =>
      getTextValue(candidate.node)
        .toLocaleLowerCase()
        .startsWith(typeahead.current)
    )
    if (match) focusNode(match.node.id)
  }

  function renderNodes(
    treeNodes: TreeNode[],
    depth = 0,
    parentId?: string
  ): React.ReactNode {
    return treeNodes.map(node => {
      const item = { node, depth, parentId }
      const hasChildren = Boolean(node.children?.length)
      const isExpanded = activeExpanded.includes(node.id)
      const isSelected = activeSelected === node.id

      return (
        <React.Fragment key={node.id}>
          <div
            ref={element => {
              if (element) rowRefs.current.set(node.id, element)
              else rowRefs.current.delete(node.id)
            }}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-level={depth + 1}
            aria-selected={isSelected}
            tabIndex={focusedId === node.id ? 0 : -1}
            data-selected={isSelected ? '' : undefined}
            data-expanded={isExpanded ? '' : undefined}
            className={cn(
              'group/tree-item flex min-h-9 min-w-0 cursor-default items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-control text-foreground outline-none transition-colors',
              'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40',
              'data-selected:bg-accent data-selected:text-accent-foreground'
            )}
            style={{ paddingInlineStart: `${depth * 20 + 8}px` }}
            onClick={() => {
              selectNode(node.id)
              if (hasChildren) toggleExpanded(node.id)
            }}
            onFocus={() => setFocusedId(node.id)}
            onKeyDown={event => handleKeyDown(event, item)}
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              {hasChildren ? (
                <Icon
                  icon={ArrowRight01Icon}
                  size={12}
                  className={cn(
                    'text-text-meta transition-transform duration-200 ease-disclosure motion-reduce:transition-none',
                    isExpanded && 'rotate-90'
                  )}
                />
              ) : null}
            </span>
            {node.icon ? (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-text-secondary">
                <Icon icon={node.icon} size={16} />
              </span>
            ) : null}
            <span className="min-w-0 flex-1 truncate text-left">
              {node.label}
            </span>
            {node.meta ? (
              <span className="shrink-0 text-caption text-text-meta">
                {node.meta}
              </span>
            ) : null}
          </div>
          {hasChildren ? (
            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.div
                  key={`${node.id}-children`}
                  role="group"
                  initial={reduceMotion ? false : { height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={reduceMotion ? undefined : { height: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.2,
                    ease: [0.2, 0, 0, 1],
                  }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5">
                    {renderNodes(node.children ?? [], depth + 1, node.id)}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}
        </React.Fragment>
      )
    })
  }

  return (
    <div
      role="tree"
      data-slot="tree-view"
      className={cn('min-w-0 space-y-0.5', className)}
      {...props}
    >
      {renderNodes(nodes)}
    </div>
  )
}

function flattenVisibleNodes(
  nodes: TreeNode[],
  expanded: Set<string>,
  depth = 0,
  parentId?: string
): VisibleTreeNode[] {
  return nodes.flatMap(node => [
    { node, depth, parentId },
    ...(node.children?.length && expanded.has(node.id)
      ? flattenVisibleNodes(node.children, expanded, depth + 1, node.id)
      : []),
  ])
}

function getTextValue(node: TreeNode) {
  if (node.textValue) return node.textValue
  return typeof node.label === 'string' ? node.label : node.id
}

export type { TreeNode, TreeViewProps }
export { TreeView }
