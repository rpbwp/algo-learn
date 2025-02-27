import type {
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { createContext, PropsWithChildren, useContext, useMemo } from "react"
import { RxDragHandleHorizontal } from "react-icons/rx"

export interface Props {
  id: UniqueIdentifier
  disabled?: boolean
}

interface Context {
  attributes: Record<string, any>
  listeners: DraggableSyntheticListeners
  ref(node: HTMLElement | null): void
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
})

/**
 * SortableItem is a wrapper for a sortable item.
 *
 * @param props
 * @param props.children Children of the sortable item.
 * @param props.id A unique id for the item.
 * @param props.disabled Whether the item is disabled.
 */
export function SortableItem({
  children,
  id,
  disabled = false,
}: PropsWithChildren<Props>) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  })
  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef],
  )
  return (
    <SortableItemContext.Provider value={context}>
      <li
        className={`flex flex-grow select-none list-none items-center justify-between gap-5 ${
          disabled ? "cursor-default" : ""
        }  ${isDragging ? "z-10" : ""}`}
        ref={disabled ? null : setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        {...attributes}
        {...listeners}
      >
        {children}
      </li>
    </SortableItemContext.Provider>
  )
}

export function DragHandle() {
  const { attributes, listeners, ...rest } = useContext(SortableItemContext)
  const ref = (x: HTMLElement | null) => rest.ref(x)
  return (
    <button
      className="px-2 py-5 hover:bg-black/20"
      {...attributes}
      {...listeners}
      ref={ref}
    >
      <RxDragHandleHorizontal />
    </button>
  )
}
