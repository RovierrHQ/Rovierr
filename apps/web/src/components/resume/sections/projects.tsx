'use client'

import { type Project, projectSchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useAtom } from 'jotai'
import { Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { projectsAtom } from '../lib/atoms'

const defaultProject: Omit<Project, 'id'> = {
  name: '',
  description: '',
  technologies: [],
  startDate: '',
  endDate: '',
  url: '',
  order: 0
}

export function ProjectsSection() {
  const [projects, setProjects] = useAtom(projectsAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [_techInput, setTechInput] = useState('')

  const form = useAppForm({
    validators: { onSubmit: projectSchema },
    defaultValues: {
      ...defaultProject,
      id: nanoid(),
      technologies: [],
      order: projects.length
    } as Project,
    onSubmit({ value }) {
      let updatedProjects: Project[]
      if (editingId) {
        updatedProjects = projects.map((item) =>
          item.id === editingId ? value : item
        )
      } else {
        updatedProjects = [...projects, value]
      }

      setProjects(updatedProjects)
      setIsAdding(false)
      setEditingId(null)
      setTechInput('')
      form.reset({
        ...defaultProject,
        id: nanoid(),
        technologies: [],
        order: projects.length
      })
    }
  })

  const handleDelete = (id: string) => {
    const updatedProjects = projects.filter((item) => item.id !== id)
    setProjects(updatedProjects)
  }

  const handleEdit = (item: Project) => {
    setEditingId(item.id)
    setIsAdding(true)
    form.reset(item)
  }

  // const addTechnology = () => {
  //   if (techInput.trim()) {
  //     form.setFieldValue('technologies', [
  //       ...form.state.values.technologies,
  //       techInput.trim()
  //     ])
  //     setTechInput('')
  //   }
  // }

  // const removeTechnology = (index: number) => {
  //   form.setFieldValue(
  //     'technologies',
  //     form.state.values.technologies.filter((_, i) => i !== index)
  //   )
  // }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="font-bold text-2xl">Projects</h2>
        <p className="text-muted-foreground text-sm">Showcase your projects</p>
      </div>

      <div className="space-y-4">
        {projects.length === 0 && !isAdding && (
          <div className="py-8 text-center text-muted-foreground">
            <p>No projects yet.</p>
          </div>
        )}

        {projects.map((item) => (
          <div
            className="rounded-lg border p-4 transition-colors hover:border-primary"
            key={item.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                {item.url && <p className="text-primary text-sm">{item.url}</p>}
                <p className="mt-2 text-sm">{item.description}</p>
                {item.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.technologies.map((tech: string, idx: number) => (
                      <span
                        className="rounded bg-primary/10 px-2 py-1 text-primary text-xs"
                        // biome-ignore lint/suspicious/noArrayIndexKey: <>
                        key={idx}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
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
            {editingId ? 'Edit' : 'Add'} Project
          </h3>
          <form.AppField
            children={(field) => (
              <field.Text
                label="Project Name"
                placeholder="e.g., E-commerce Platform"
              />
            )}
            name="name"
          />
          <form.AppField
            children={(field) => (
              <field.Text
                label="URL (optional)"
                placeholder="https://github.com/..."
              />
            )}
            name="url"
          />
          <form.AppField
            children={(field) => (
              <field.TextArea
                label="Description"
                placeholder="Describe the project..."
                rows={4}
              />
            )}
            name="description"
          />

          {/* <div>
            <Label className="font-medium text-sm">Technologies</Label>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded border px-3 py-2"
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTechnology())
                }
                placeholder="Add technology..."
                type="text"
                value={techInput}
              />
              <Button onClick={addTechnology} type="button">
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formValues.technologies.map((tech, idx) => (
                <span
                  className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-primary text-sm"
                  key={idx}
                >
                  {tech}
                  <button onClick={() => removeTechnology(idx)} type="button">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div> */}

          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                setTechInput('')
                form.reset({
                  ...defaultProject,
                  id: nanoid(),
                  technologies: [],
                  order: projects.length
                })
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
          Add Project
        </Button>
      )}
    </div>
  )
}
