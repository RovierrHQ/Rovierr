'use client'

import { type Volunteer, volunteerSchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useAtom } from 'jotai'
import { Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { volunteerAtom } from '../lib/atoms'

const defaultVolunteer: Omit<Volunteer, 'id'> = {
  organization: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: ''
}

export function VolunteerSection() {
  const [volunteer, setVolunteer] = useAtom(volunteerAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useAppForm({
    validators: { onSubmit: volunteerSchema },
    defaultValues: { ...defaultVolunteer, id: nanoid() } as Volunteer,
    onSubmit({ value }) {
      let updatedVolunteer: Volunteer[]
      if (editingId) {
        updatedVolunteer = volunteer.map((item) =>
          item.id === editingId ? value : item
        )
      } else {
        updatedVolunteer = [...volunteer, value]
      }

      setVolunteer(updatedVolunteer)
      setIsAdding(false)
      setEditingId(null)
      form.reset({ ...defaultVolunteer, id: nanoid() })
    }
  })

  const handleDelete = (id: string) => {
    const updatedVolunteer = volunteer.filter((item) => item.id !== id)
    setVolunteer(updatedVolunteer)
  }

  const handleEdit = (item: Volunteer) => {
    setEditingId(item.id)
    setIsAdding(true)
    form.reset(item)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="font-bold text-2xl">Volunteer Experience</h2>
        <p className="text-muted-foreground text-sm">Add your volunteer work</p>
      </div>

      <div className="space-y-4">
        {volunteer.length === 0 && !isAdding && (
          <div className="py-8 text-center text-muted-foreground">
            <p>No volunteer experience yet.</p>
          </div>
        )}

        {volunteer.map((item) => (
          <div
            className="rounded-lg border p-4 transition-colors hover:border-primary"
            key={item.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{item.role}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.organization}
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
            {editingId ? 'Edit' : 'Add'} Volunteer Experience
          </h3>
          <form.AppField
            children={(field) => (
              <field.Text label="Organization" placeholder="e.g., Red Cross" />
            )}
            name="organization"
          />
          <form.AppField
            children={(field) => (
              <field.Text
                label="Role"
                placeholder="e.g., Volunteer Coordinator"
              />
            )}
            name="role"
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
              <field.Checkbox label="I currently volunteer here" />
            )}
            name="current"
          />
          <form.AppField
            children={(field) => (
              <field.TextArea
                label="Description"
                placeholder="Describe your volunteer work..."
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
                form.reset({ ...defaultVolunteer, id: nanoid() })
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
          Add Volunteer Experience
        </Button>
      )}
    </div>
  )
}
