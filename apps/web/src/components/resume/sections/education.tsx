'use client'

import { type Education, educationSchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useAtom } from 'jotai'
import { Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useMemo, useState } from 'react'
import { educationAtom } from '../lib/atoms'

const defaultEducation: Omit<Education, 'id'> = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  current: false,
  gpa: '',
  gpaScale: ''
}

// ============================================================================
// Utility Functions
// ============================================================================

function sortByDate(items: Education[]): Education[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.endDate || a.startDate)
    const dateB = new Date(b.endDate || b.startDate)
    return dateB.getTime() - dateA.getTime()
  })
}

// ============================================================================
// Component
// ============================================================================

export function EducationSection() {
  const [education, setEducation] = useAtom(educationAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useAppForm({
    validators: { onSubmit: educationSchema },
    defaultValues: { ...defaultEducation, id: nanoid() } as Education,
    onSubmit({ value }) {
      let updatedEducation: Education[]
      if (editingId) {
        updatedEducation = education.map((item) =>
          item.id === editingId ? value : item
        )
      } else {
        updatedEducation = [...education, value]
      }

      setEducation(sortByDate(updatedEducation))
      setIsAdding(false)
      setEditingId(null)
      form.reset({ ...defaultEducation, id: nanoid() })
    }
  })

  const handleDelete = (id: string) => {
    const updatedEducation = education.filter((item) => item.id !== id)
    setEducation(updatedEducation)
  }

  const handleEdit = (item: Education) => {
    setEditingId(item.id)
    setIsAdding(true)
    form.reset(item)
  }

  const sortedEducation = useMemo(() => sortByDate(education), [education])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Education</h2>
          <p className="text-muted-foreground text-sm">
            Add your academic background
          </p>
        </div>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {sortedEducation.length === 0 && !isAdding && (
          <div className="py-8 text-center text-muted-foreground">
            <p>No education entries yet. Add your academic background.</p>
          </div>
        )}

        {sortedEducation.map((item) => (
          <div
            className="space-y-2 rounded-lg border p-4 transition-colors hover:border-primary"
            key={item.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{item.institution}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.degree} in {item.fieldOfStudy}
                </p>
                <p className="text-muted-foreground text-sm">
                  {item.startDate} - {item.current ? 'Present' : item.endDate}
                  {item.gpa && ` • GPA: ${item.gpa}/${item.gpaScale || 4.0}`}
                </p>
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

      {/* Add/Edit Form */}
      {isAdding ? (
        <form
          className="space-y-4 rounded-lg border p-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <h3 className="font-semibold">
            {editingId ? 'Edit Education' : 'Add Education'}
          </h3>

          <form.AppField
            children={(field) => (
              <field.Text
                label="Institution"
                placeholder="e.g., Stanford University"
              />
            )}
            name="institution"
          />

          <form.AppField
            children={(field) => (
              <field.Text
                label="Degree"
                placeholder="e.g., Bachelor of Science"
              />
            )}
            name="degree"
          />

          <form.AppField
            children={(field) => (
              <field.Text
                label="Field of Study"
                placeholder="e.g., Computer Science"
              />
            )}
            name="fieldOfStudy"
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              children={(field) => (
                <field.Text label="Start Date" placeholder="e.g., Sep 2020" />
              )}
              name="startDate"
            />

            <form.AppField
              children={(field) => (
                <field.Text label="End Date" placeholder="e.g., May 2024" />
              )}
              name="endDate"
            />
          </div>

          <form.AppField
            children={(field) => (
              <field.Checkbox label="I currently study here" />
            )}
            name="current"
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              children={(field) => (
                <field.Text label="GPA (optional)" placeholder="e.g., 3.8" />
              )}
              name="gpa"
            />

            <form.AppField
              children={(field) => (
                <field.Text label="GPA Scale" placeholder="e.g., 4.0" />
              )}
              name="gpaScale"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                form.reset({ ...defaultEducation, id: nanoid() })
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
          Add Education
        </Button>
      )}
    </div>
  )
}
