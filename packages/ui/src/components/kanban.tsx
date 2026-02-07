'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import {
  type Announcements,
  type CollisionDetection,
  closestCenter,
  closestCorners,
  DndContext,
  type DndContextProps,
  type DragCancelEvent,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  type DroppableContainer,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  KeyboardCode,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  type AnimateLayoutChanges,
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  SortableContext,
  type SortableContextProps,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useComposedRefs } from '@rov/ui/lib/compose-refs'
import { cn } from '@rov/ui/lib/utils'
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left
]

const coordinateGetter: KeyboardCoordinateGetter = (event, { context }) => {
  const { active, droppableRects, droppableContainers, collisionRect } = context

  if (directions.includes(event.code)) {
    event.preventDefault()

    if (!(active && collisionRect)) return

    const filteredContainers: DroppableContainer[] = []

    for (const entry of droppableContainers.getEnabled()) {
      if (!entry || entry?.disabled) return

      const rect = droppableRects.get(entry.id)

      if (!rect) return

      const data = entry.data.current

      if (data) {
        const { type, children } = data

        if (
          type === 'container' &&
          children?.length > 0 &&
          active.data.current?.type !== 'container'
        ) {
          return
        }
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry)
          }
          break
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry)
          }
          break
        case KeyboardCode.Left:
          if (collisionRect.left >= rect.left + rect.width) {
            filteredContainers.push(entry)
          }
          break
        case KeyboardCode.Right:
          if (collisionRect.left + collisionRect.width <= rect.left) {
            filteredContainers.push(entry)
          }
          break
        default:
          break
      }
    }

    const collisions = closestCorners({
      active,
      collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null
    })
    const closestId = getFirstCollision(collisions, 'id')

    if (closestId != null) {
      const newDroppable = droppableContainers.get(closestId)
      const newNode = newDroppable?.node.current
      const newRect = newDroppable?.rect.current

      if (newNode && newRect) {
        if (newDroppable.id === 'placeholder') {
          return {
            x: newRect.left + (newRect.width - collisionRect.width) / 2,
            y: newRect.top + (newRect.height - collisionRect.height) / 2
          }
        }

        if (newDroppable.data.current?.type === 'container') {
          return {
            x: newRect.left + 20,
            y: newRect.top + 74
          }
        }

        return {
          x: newRect.left,
          y: newRect.top
        }
      }
    }
  }

  return undefined
}

const ROOT_NAME = 'Kanban'
const BOARD_NAME = 'KanbanBoard'
const COLUMN_NAME = 'KanbanColumn'
const COLUMN_HANDLE_NAME = 'KanbanColumnHandle'
const ITEM_NAME = 'KanbanItem'
const ITEM_HANDLE_NAME = 'KanbanItemHandle'
const OVERLAY_NAME = 'KanbanOverlay'

type KanbanContextValue<T> = {
  id: string
  items: Record<UniqueIdentifier, T[]>
  modifiers: DndContextProps['modifiers']
  strategy: SortableContextProps['strategy']
  orientation: 'horizontal' | 'vertical'
  activeId: UniqueIdentifier | null
  setActiveId: (id: UniqueIdentifier | null) => void
  getItemValue: (item: T) => UniqueIdentifier
  flatCursor: boolean
}

const KanbanContext = createContext<KanbanContextValue<unknown> | null>(null)

function useKanbanContext(consumerName: string) {
  const context = useContext(KanbanContext)
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``)
  }
  return context
}

type GetItemValue<T> = {
  /**
   * Callback that returns a unique identifier for each kanban item. Required for array of objects.
   * @example getItemValue={(item) => item.id}
   */
  getItemValue: (item: T) => UniqueIdentifier
}

type KanbanProps<T> = Omit<DndContextProps, 'collisionDetection'> &
  (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>) & {
    value: Record<UniqueIdentifier, T[]>
    onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void
    onMove?: (
      event: DragEndEvent & { activeIndex: number; overIndex: number }
    ) => void
    strategy?: SortableContextProps['strategy']
    orientation?: 'horizontal' | 'vertical'
    flatCursor?: boolean
  }

function Kanban<T>(props: KanbanProps<T>) {
  const {
    value,
    onValueChange,
    modifiers,
    strategy = verticalListSortingStrategy,
    orientation = 'horizontal',
    onMove,
    getItemValue: getItemValueProp,
    accessibility,
    flatCursor = false,
    ...kanbanProps
  } = props

  const id = useId()
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverIdRef = useRef<UniqueIdentifier | null>(null)
  const hasMovedRef = useRef(false)
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter
    })
  )

  const getItemValue = useCallback(
    (item: T): UniqueIdentifier => {
      if (typeof item === 'object' && !getItemValueProp) {
        throw new Error(
          '`getItemValue` is required when using array of objects'
        )
      }
      return getItemValueProp
        ? getItemValueProp(item)
        : (item as UniqueIdentifier)
    },
    [getItemValueProp]
  )

  const getColumn = useCallback(
    (id: UniqueIdentifier) => {
      if (id in value) return id

      for (const [columnId, items] of Object.entries(value)) {
        if (items.some((item) => getItemValue(item) === id)) {
          return columnId
        }
      }

      return null
    },
    [value, getItemValue]
  )

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in value) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in value
          )
        })
      }

      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args)
      let overId = getFirstCollision(intersections, 'id')

      if (!overId) {
        if (hasMovedRef.current) {
          lastOverIdRef.current = activeId
        }
        return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : []
      }

      if (overId in value) {
        const containerItems = value[overId]
        if (containerItems && containerItems.length > 0) {
          const closestItem = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                containerItems.some(
                  (item) => getItemValue(item) === container.id
                )
            )
          })

          if (closestItem.length > 0) {
            overId = closestItem[0]?.id ?? overId
          }
        }
      }

      lastOverIdRef.current = overId
      return [{ id: overId }]
    },
    [activeId, value, getItemValue]
  )

  const onDragStart = useCallback((event: DragStartEvent) => {
    kanbanProps.onDragStart?.(event)

    if (event.activatorEvent.defaultPrevented) return
    setActiveId(event.active.id)
  }, [])

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      kanbanProps.onDragOver?.(event)

      if (event.activatorEvent.defaultPrevented) return

      const { active, over } = event
      if (!over) return

      const activeColumn = getColumn(active.id)
      const overColumn = getColumn(over.id)

      if (!(activeColumn && overColumn)) return

      if (activeColumn === overColumn) {
        const items = value[activeColumn]
        if (!items) return

        const activeIndex = items.findIndex(
          (item) => getItemValue(item) === active.id
        )
        const overIndex = items.findIndex(
          (item) => getItemValue(item) === over.id
        )

        if (activeIndex !== overIndex) {
          const newColumns = { ...value }
          newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex)
          onValueChange?.(newColumns)
        }
      } else {
        const activeItems = value[activeColumn]
        const overItems = value[overColumn]

        if (!(activeItems && overItems)) return

        const activeIndex = activeItems.findIndex(
          (item) => getItemValue(item) === active.id
        )

        if (activeIndex === -1) return

        const activeItem = activeItems[activeIndex]
        if (!activeItem) return

        const updatedItems = {
          ...value,
          [activeColumn]: activeItems.filter(
            (item) => getItemValue(item) !== active.id
          ),
          [overColumn]: [...overItems, activeItem]
        }

        onValueChange?.(updatedItems)
        hasMovedRef.current = true
      }
    },
    [value, getColumn, getItemValue, onValueChange]
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      kanbanProps.onDragEnd?.(event)

      if (event.activatorEvent.defaultPrevented) return

      const { active, over } = event

      if (!over) {
        setActiveId(null)
        return
      }

      if (active.id in value && over.id in value) {
        const activeIndex = Object.keys(value).indexOf(active.id as string)
        const overIndex = Object.keys(value).indexOf(over.id as string)

        if (activeIndex !== overIndex) {
          const orderedColumns = Object.keys(value)
          const newOrder = arrayMove(orderedColumns, activeIndex, overIndex)

          const newColumns: Record<UniqueIdentifier, T[]> = {}
          for (const key of newOrder) {
            const items = value[key]
            if (items) {
              newColumns[key] = items
            }
          }

          if (onMove) {
            onMove({ ...event, activeIndex, overIndex })
          } else {
            onValueChange?.(newColumns)
          }
        }
      } else {
        const activeColumn = getColumn(active.id)
        const overColumn = getColumn(over.id)

        if (!(activeColumn && overColumn)) {
          setActiveId(null)
          return
        }

        if (activeColumn === overColumn) {
          const items = value[activeColumn]
          if (!items) {
            setActiveId(null)
            return
          }

          const activeIndex = items.findIndex(
            (item) => getItemValue(item) === active.id
          )
          const overIndex = items.findIndex(
            (item) => getItemValue(item) === over.id
          )

          if (activeIndex !== overIndex) {
            const newColumns = { ...value }
            newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex)
            if (onMove) {
              onMove({
                ...event,
                activeIndex,
                overIndex
              })
            } else {
              onValueChange?.(newColumns)
            }
          }
        }
      }

      setActiveId(null)
      hasMovedRef.current = false
    },
    [value, getColumn, getItemValue, onValueChange, onMove]
  )

  const onDragCancel = useCallback((event: DragCancelEvent) => {
    kanbanProps.onDragCancel?.(event)

    if (event.activatorEvent.defaultPrevented) return

    setActiveId(null)
    hasMovedRef.current = false
  }, [])

  const announcements: Announcements = useMemo(
    () => ({
      onDragStart({ active }) {
        const isColumn = active.id in value
        const itemType = isColumn ? 'column' : 'item'
        const position = isColumn
          ? Object.keys(value).indexOf(active.id as string) + 1
          : (() => {
              const column = getColumn(active.id)
              if (!(column && value[column])) return 1
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === active.id
                ) + 1
              )
            })()
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(active.id)
              return column ? (value[column]?.length ?? 0) : 0
            })()

        return `Picked up ${itemType} at position ${position} of ${total}`
      },
      onDragOver({ active, over }) {
        if (!over) return

        const isColumn = active.id in value
        const itemType = isColumn ? 'column' : 'item'
        const position = isColumn
          ? Object.keys(value).indexOf(over.id as string) + 1
          : (() => {
              const column = getColumn(over.id)
              if (!(column && value[column])) return 1
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === over.id
                ) + 1
              )
            })()
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(over.id)
              return column ? (value[column]?.length ?? 0) : 0
            })()

        const overColumn = getColumn(over.id)
        const activeColumn = getColumn(active.id)

        if (isColumn) {
          return `${itemType} is now at position ${position} of ${total}`
        }

        if (activeColumn !== overColumn) {
          return `${itemType} is now at position ${position} of ${total} in ${overColumn}`
        }

        return `${itemType} is now at position ${position} of ${total}`
      },
      onDragEnd({ active, over }) {
        if (!over) return

        const isColumn = active.id in value
        const itemType = isColumn ? 'column' : 'item'
        const position = isColumn
          ? Object.keys(value).indexOf(over.id as string) + 1
          : (() => {
              const column = getColumn(over.id)
              if (!(column && value[column])) return 1
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === over.id
                ) + 1
              )
            })()
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(over.id)
              return column ? (value[column]?.length ?? 0) : 0
            })()

        const overColumn = getColumn(over.id)
        const activeColumn = getColumn(active.id)

        if (isColumn) {
          return `${itemType} was dropped at position ${position} of ${total}`
        }

        if (activeColumn !== overColumn) {
          return `${itemType} was dropped at position ${position} of ${total} in ${overColumn}`
        }

        return `${itemType} was dropped at position ${position} of ${total}`
      },
      onDragCancel({ active }) {
        const isColumn = active.id in value
        const itemType = isColumn ? 'column' : 'item'
        return `Dragging was cancelled. ${itemType} was dropped.`
      }
    }),
    [value, getColumn, getItemValue]
  )

  const contextValue = useMemo<KanbanContextValue<T>>(
    () => ({
      id,
      items: value,
      modifiers,
      strategy,
      orientation,
      activeId,
      setActiveId,
      getItemValue,
      flatCursor
    }),
    [
      id,
      value,
      activeId,
      modifiers,
      strategy,
      orientation,
      getItemValue,
      flatCursor
    ]
  )

  return (
    <KanbanContext.Provider value={contextValue as KanbanContextValue<unknown>}>
      <DndContext
        collisionDetection={collisionDetection}
        modifiers={modifiers}
        sensors={sensors}
        {...kanbanProps}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: `
            To pick up a kanban item or column, press space or enter.
            While dragging, use the arrow keys to move the item.
            Press space or enter again to drop the item in its new position, or press escape to cancel.
          `
          },
          ...accessibility
        }}
        id={id}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
      />
    </KanbanContext.Provider>
  )
}

const KanbanBoardContext = createContext<boolean>(false)

interface KanbanBoardProps extends useRender.ComponentProps<'div'> {
  children?: ReactNode
}

function KanbanBoard(props: KanbanBoardProps) {
  const { className, render, ref, ...boardProps } = props

  const context = useKanbanContext(BOARD_NAME)

  const columns = useMemo(() => {
    return Object.keys(context.items)
  }, [context.items])

  const boardElement = useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex size-full gap-4',
          context.orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )
      },
      {
        'aria-orientation': context.orientation,
        'data-orientation': context.orientation,
        'data-slot': 'kanban-board',
        ref,
        ...boardProps
      } as ComponentProps<'div'>
    ),
    render,
    state: { slot: 'kanban-board' }
  })

  return (
    <KanbanBoardContext.Provider value={true}>
      <SortableContext
        items={columns}
        strategy={
          context.orientation === 'horizontal'
            ? horizontalListSortingStrategy
            : verticalListSortingStrategy
        }
      >
        {boardElement}
      </SortableContext>
    </KanbanBoardContext.Provider>
  )
}

type KanbanColumnContextValue = {
  id: string
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners | undefined
  setActivatorNodeRef: (node: HTMLElement | null) => void
  isDragging?: boolean
  disabled?: boolean
}

const KanbanColumnContext = createContext<KanbanColumnContextValue | null>(null)

function useKanbanColumnContext(consumerName: string) {
  const context = useContext(KanbanColumnContext)
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${COLUMN_NAME}\``
    )
  }
  return context
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

interface KanbanColumnProps extends useRender.ComponentProps<'div'> {
  value: UniqueIdentifier
  children?: ReactNode
  asHandle?: boolean
  disabled?: boolean
}

function KanbanColumn(props: KanbanColumnProps) {
  const {
    value,
    asHandle,
    disabled,
    className,
    style,
    ref,
    render,
    ...columnProps
  } = props

  const id = useId()
  const context = useKanbanContext(COLUMN_NAME)
  const inBoard = useContext(KanbanBoardContext)
  const inOverlay = useContext(KanbanOverlayContext)

  if (!(inBoard || inOverlay)) {
    throw new Error(
      `\`${COLUMN_NAME}\` must be used within \`${BOARD_NAME}\` or \`${OVERLAY_NAME}\``
    )
  }

  if (value === '') {
    throw new Error(`\`${COLUMN_NAME}\` value cannot be an empty string`)
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: value,
    disabled,
    animateLayoutChanges
  })

  const composedRef = useComposedRefs(ref, (node) => {
    if (disabled) return
    setNodeRef(node)
  })

  const composedStyle = useMemo<CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      ...style
    }
  }, [transform, transition, style])

  const items = useMemo(() => {
    const items = context.items[value] ?? []
    return items.map((item) => context.getItemValue(item))
  }, [context, value])

  const columnContext = useMemo<KanbanColumnContextValue>(
    () => ({
      id,
      attributes,
      listeners,
      setActivatorNodeRef,
      isDragging,
      disabled
    }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled]
  )

  const columnElement = useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex size-full flex-col gap-2 rounded-lg border bg-zinc-100 p-2.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-zinc-900',
          {
            'touch-none select-none': asHandle,
            'cursor-default': context.flatCursor,
            'data-dragging:cursor-grabbing': !context.flatCursor,
            'cursor-grab': !isDragging && asHandle && !context.flatCursor,
            'opacity-50': isDragging,
            'pointer-events-none opacity-50': disabled
          },
          className
        ),
        ref: composedRef,
        style: composedStyle
      },
      {
        'data-disabled': disabled,
        'data-dragging': isDragging ? '' : undefined,
        'data-slot': 'kanban-column',
        id,
        ...(asHandle && !disabled ? attributes : {}),
        ...(asHandle && !disabled ? listeners : {}),
        ...columnProps
      } as ComponentProps<'div'>
    ),
    render,
    state: { slot: 'kanban-column' }
  })

  return (
    <KanbanColumnContext.Provider value={columnContext}>
      <SortableContext
        items={items}
        strategy={
          context.orientation === 'horizontal'
            ? horizontalListSortingStrategy
            : verticalListSortingStrategy
        }
      >
        {columnElement}
      </SortableContext>
    </KanbanColumnContext.Provider>
  )
}

interface KanbanColumnHandleProps extends useRender.ComponentProps<'button'> {}

function KanbanColumnHandle(props: KanbanColumnHandleProps) {
  const { disabled, className, render, ref, ...columnHandleProps } = props

  const context = useKanbanContext(COLUMN_NAME)
  const columnContext = useKanbanColumnContext(COLUMN_HANDLE_NAME)

  const isDisabled = disabled ?? columnContext.disabled

  const composedRef = useComposedRefs(ref, (node) => {
    if (isDisabled) return
    columnContext.setActivatorNodeRef(node)
  })

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn(
          'select-none disabled:pointer-events-none disabled:opacity-50',
          context.flatCursor
            ? 'cursor-default'
            : 'cursor-grab data-dragging:cursor-grabbing',
          className
        ),
        disabled: isDisabled,
        ref: composedRef
      },
      {
        'aria-controls': columnContext.id,
        'data-disabled': isDisabled,
        'data-dragging': columnContext.isDragging ? '' : undefined,
        'data-slot': 'kanban-column-handle',
        type: 'button',
        ...(isDisabled ? {} : columnContext.attributes),
        ...(isDisabled ? {} : columnContext.listeners),
        ...columnHandleProps
      } as ComponentProps<'button'>
    ),
    render,
    state: { slot: 'kanban-column-handle' }
  })
}

type KanbanItemContextValue = {
  id: string
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners | undefined
  setActivatorNodeRef: (node: HTMLElement | null) => void
  isDragging?: boolean
  disabled?: boolean
}

const KanbanItemContext = createContext<KanbanItemContextValue | null>(null)

function useKanbanItemContext(consumerName: string) {
  const context = useContext(KanbanItemContext)
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``)
  }
  return context
}

interface KanbanItemProps extends useRender.ComponentProps<'div'> {
  value: UniqueIdentifier
  asHandle?: boolean
  disabled?: boolean
}

function KanbanItem(props: KanbanItemProps) {
  const {
    value,
    style,
    asHandle,
    disabled,
    className,
    ref,
    render,
    ...itemProps
  } = props

  const id = useId()
  const context = useKanbanContext(ITEM_NAME)
  const inBoard = useContext(KanbanBoardContext)
  const inOverlay = useContext(KanbanOverlayContext)

  if (!(inBoard || inOverlay)) {
    throw new Error(`\`${ITEM_NAME}\` must be used within \`${BOARD_NAME}\``)
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: value, disabled })

  if (value === '') {
    throw new Error(`\`${ITEM_NAME}\` value cannot be an empty string`)
  }

  const composedRef = useComposedRefs(ref, (node) => {
    if (disabled) return
    setNodeRef(node)
  })

  const composedStyle = useMemo<CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      ...style
    }
  }, [transform, transition, style])

  const itemContext = useMemo<KanbanItemContextValue>(
    () => ({
      id,
      attributes,
      listeners,
      setActivatorNodeRef,
      isDragging,
      disabled
    }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled]
  )

  const itemElement = useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
          {
            'touch-none select-none': asHandle,
            'cursor-default': context.flatCursor,
            'data-dragging:cursor-grabbing': !context.flatCursor,
            'cursor-grab': !isDragging && asHandle && !context.flatCursor,
            'opacity-50': isDragging,
            'pointer-events-none opacity-50': disabled
          },
          className
        ),
        ref: composedRef,
        style: composedStyle
      },
      {
        'data-disabled': disabled,
        'data-dragging': isDragging ? '' : undefined,
        'data-slot': 'kanban-item',
        id,
        ...(asHandle && !disabled ? attributes : {}),
        ...(asHandle && !disabled ? listeners : {}),
        ...itemProps
      } as ComponentProps<'div'>
    ),
    render,
    state: { slot: 'kanban-item' }
  })

  return (
    <KanbanItemContext.Provider value={itemContext}>
      {itemElement}
    </KanbanItemContext.Provider>
  )
}

interface KanbanItemHandleProps extends useRender.ComponentProps<'button'> {}

function KanbanItemHandle(props: KanbanItemHandleProps) {
  const { disabled, className, render, ref, ...itemHandleProps } = props

  const context = useKanbanContext(ITEM_HANDLE_NAME)
  const itemContext = useKanbanItemContext(ITEM_HANDLE_NAME)

  const isDisabled = disabled ?? itemContext.disabled

  const composedRef = useComposedRefs(ref, (node) => {
    if (isDisabled) return
    itemContext.setActivatorNodeRef(node)
  })

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn(
          'select-none disabled:pointer-events-none disabled:opacity-50',
          context.flatCursor
            ? 'cursor-default'
            : 'cursor-grab data-dragging:cursor-grabbing',
          className
        ),
        disabled: isDisabled,
        ref: composedRef
      },
      {
        'aria-controls': itemContext.id,
        'data-disabled': isDisabled,
        'data-dragging': itemContext.isDragging ? '' : undefined,
        'data-slot': 'kanban-item-handle',
        type: 'button',
        ...(isDisabled ? {} : itemContext.attributes),
        ...(isDisabled ? {} : itemContext.listeners),
        ...itemHandleProps
      } as ComponentProps<'button'>
    ),
    render,
    state: { slot: 'kanban-item-handle' }
  })
}

const KanbanOverlayContext = createContext(false)

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4'
      }
    }
  })
}

interface KanbanOverlayProps
  extends Omit<ComponentProps<typeof DragOverlay>, 'children'> {
  container?: Element | DocumentFragment | null
  children?:
    | ReactNode
    | ((params: {
        value: UniqueIdentifier
        variant: 'column' | 'item'
      }) => ReactNode)
}

function KanbanOverlay(props: KanbanOverlayProps) {
  const { container: containerProp, children, ...overlayProps } = props

  const context = useKanbanContext(OVERLAY_NAME)

  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => setMounted(true), [])

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null)

  if (!container) return null

  const variant =
    context.activeId && context.activeId in context.items ? 'column' : 'item'

  return createPortal(
    <DragOverlay
      className={cn(!context.flatCursor && 'cursor-grabbing')}
      dropAnimation={dropAnimation}
      modifiers={context.modifiers}
      {...overlayProps}
    >
      <KanbanOverlayContext.Provider value={true}>
        {context.activeId && children
          ? typeof children === 'function'
            ? children({
                value: context.activeId,
                variant
              })
            : children
          : null}
      </KanbanOverlayContext.Provider>
    </DragOverlay>,
    container
  )
}

export {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  //
  type KanbanProps
}
