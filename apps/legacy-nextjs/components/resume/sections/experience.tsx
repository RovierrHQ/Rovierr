'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type Experience, experienceSchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useAtom } from 'jotai'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useMemo, useState } from 'react'
import { experienceAtom } from '../lib/atoms'

const defaultExperience: Omit<Experience, 'id'> = {
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: ''
}

function sortByDate(items: Experience[]): Experience[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.endDate || a.startDate)
    const dateB = new Date(b.endDate || b.startDate)
    return dateB.getTime() - dateA.getTime()
  })
}

function SortableExperienceItem({
  item,
  onEdit,
  onDelete
}: {
  item: Experience
  onEdit: (item: Experience) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      className="rounded-lg border p-4 transition-colors hover:border-primary"
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 gap-3">
          <button
            className="cursor-grab touch-none active:cursor-grabbing"
            type="button"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h3 className="font-semibold">{item.position}</h3>
            <p className="text-muted-foreground text-sm">
              {item.company} • {item.location}
            </p>
            <p className="text-muted-foreground text-sm">
              {item.startDate} - {item.current ? 'Present' : item.endDate}
            </p>
            {item.description && (
              <div
                className="prose prose-sm mt-2 max-w-none [&_li]:ml-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_ul]:ml-4 [&_ul]:list-disc"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: expected
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onEdit(item)} size="sm" variant="ghost">
            Edit
          </Button>
          <Button onClick={() => onDelete(item.id)} size="sm" variant="ghost">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ExperienceSection() {
  const [experience, setExperience] = useAtom(experienceAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = experience.findIndex((item) => item.id === active.id)
      const newIndex = experience.findIndex((item) => item.id === over.id)
      setExperience(arrayMove(experience, oldIndex, newIndex))
    }
  }

  const form = useAppForm({
    validators: { onSubmit: experienceSchema },
    defaultValues: (editingId
      ? experience.find((exp) => exp.id === editingId)
      : { ...defaultExperience, id: nanoid() }) as Experience,
    onSubmit({ value }) {
      let updatedExperience: Experience[]
      if (editingId) {
        updatedExperience = experience.map((item) =>
          item.id === editingId ? value : item
        )
      } else {
        updatedExperience = [...experience, value]
      }

      setExperience(sortByDate(updatedExperience))
      setIsAdding(false)
      setEditingId(null)
      form.reset({ ...defaultExperience, id: nanoid() })
    }
  })

  const handleDelete = (id: string) => {
    const updatedExperience = experience.filter((item) => item.id !== id)
    setExperience(updatedExperience)
  }

  const handleEdit = (item: Experience) => {
    setEditingId(item.id)
    setIsAdding(true)
    setTimeout(() => {
      form.reset(item)
    }, 0)
  }

  const sorted = useMemo(() => sortByDate(experience), [experience])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="font-bold text-2xl">Experience</h2>
        <p className="text-muted-foreground text-sm">
          Add your work experience
        </p>
      </div>

      <div className="space-y-4">
        {sorted.length === 0 && !isAdding && (
          <div className="py-8 text-center text-muted-foreground">
            <p>No experience entries yet.</p>
          </div>
        )}

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext
            items={sorted.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {sorted.map((item) => (
              <SortableExperienceItem
                item={item}
                key={item.id}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {isAdding ? (
        <form
          className="space-y-4 rounded-lg border p-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <h3 className="font-semibold">
            {editingId ? 'Edit' : 'Add'} Experience
          </h3>
          <form.AppField
            children={(field) => (
              <field.Text label="Company" placeholder="e.g., Google" />
            )}
            name="company"
          />
          <form.AppField
            children={(field) => (
              <field.Text
                label="Position"
                placeholder="e.g., Software Engineer"
              />
            )}
            name="position"
          />
          <form.AppField
            children={(field) => (
              <field.Text
                label="Location"
                placeholder="e.g., San Francisco, CA"
              />
            )}
            name="location"
          />
          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              children={(field) => (
                <field.Text label="Start Date" placeholder="e.g., Jan 2020" />
              )}
              name="startDate"
            />
            <form.AppField
              children={(field) => (
                <field.Text label="End Date" placeholder="e.g., Dec 2023" />
              )}
              name="endDate"
            />
          </div>
          <form.AppField
            children={(field) => (
              <field.Checkbox label="I currently work here" />
            )}
            name="current"
          />
          <form.AppField
            children={(field) => (
              <field.RichText
                description="Use bullet points to highlight key accomplishments"
                label="Description"
                maxLength={2000}
                placeholder="Describe your responsibilities and achievements..."
              />
            )}
            name="description"
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                form.reset({ ...defaultExperience, id: nanoid() })
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      )}
    </div>
  )
}
