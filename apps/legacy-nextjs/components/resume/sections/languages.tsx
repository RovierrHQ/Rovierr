'use client'

import { type Language, languageSchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useAtom } from 'jotai'
import { Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { languagesAtom } from '../lib/atoms'

const defaultLanguage: Omit<Language, 'id'> = {
  name: '',
  proficiency: 'conversational'
}

export function LanguagesSection() {
  const [languages, setLanguages] = useAtom(languagesAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useAppForm({
    validators: { onSubmit: languageSchema },
    defaultValues: { ...defaultLanguage, id: nanoid() } as Language,
    onSubmit({ value }) {
      let updatedLanguages: Language[]
      if (editingId) {
        updatedLanguages = languages.map((item) =>
          item.id === editingId ? value : item
        )
      } else {
        updatedLanguages = [...languages, value]
      }

      setLanguages(updatedLanguages)
      setIsAdding(false)
      setEditingId(null)
      form.reset({ ...defaultLanguage, id: nanoid() })
    }
  })

  const handleDelete = (id: string) => {
    const updatedLanguages = languages.filter((item) => item.id !== id)
    setLanguages(updatedLanguages)
  }

  const handleEdit = (item: Language) => {
    setEditingId(item.id)
    setIsAdding(true)
    form.reset(item)
  }

  const proficiencyLabels: Record<string, string> = {
    basic: 'Basic',
    conversational: 'Conversational',
    fluent: 'Fluent',
    native: 'Native'
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="font-bold text-2xl">Languages</h2>
        <p className="text-muted-foreground text-sm">Add languages you speak</p>
      </div>

      <div className="space-y-4">
        {languages.length === 0 && !isAdding && (
          <div className="py-8 text-center text-muted-foreground">
            <p>No languages yet.</p>
          </div>
        )}

        {languages.map((item) => (
          <div
            className="rounded-lg border p-4 transition-colors hover:border-primary"
            key={item.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {proficiencyLabels[item.proficiency]}
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

      {isAdding ? (
        <form
          className="space-y-4 rounded-lg border p-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <h3 className="font-semibold">
            {editingId ? 'Edit' : 'Add'} Language
          </h3>
          <form.AppField
            children={(field) => (
              <field.Text label="Language" placeholder="e.g., Spanish" />
            )}
            name="name"
          />
          <form.AppField
            children={(field) => (
              <field.Select
                label="Proficiency Level"
                options={[
                  { label: 'Basic', value: 'basic' },
                  { label: 'Conversational', value: 'conversational' },
                  { label: 'Fluent', value: 'fluent' },
                  { label: 'Native', value: 'native' }
                ]}
                placeholder="Select proficiency level"
              />
            )}
            name="proficiency"
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                form.reset({ ...defaultLanguage, id: nanoid() })
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
          Add Language
        </Button>
      )}
    </div>
  )
}
