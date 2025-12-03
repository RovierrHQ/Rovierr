'use client'

import { type Experience, experienceSchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useAtom } from 'jotai'
import { Plus, Trash2 } from 'lucide-react'
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

export function ExperienceSection() {
  const [experience, setExperience] = useAtom(experienceAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useAppForm({
    validators: { onSubmit: experienceSchema },
    defaultValues: { ...defaultExperience, id: nanoid() } as Experience,
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
    form.reset(item)
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

        {sorted.map((item) => (
          <div
            className="rounded-lg border p-4 transition-colors hover:border-primary"
            key={item.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{item.position}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.company} • {item.location}
                </p>
                <p className="text-muted-foreground text-sm">
                  {item.startDate} - {item.current ? 'Present' : item.endDate}
                </p>
                <p className="mt-2 text-sm">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(item)}
                  size="sm"
                  variant="ghost"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(item.id)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
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
              <field.TextArea
                label="Description"
                placeholder="Describe your responsibilities..."
                rows={4}
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
