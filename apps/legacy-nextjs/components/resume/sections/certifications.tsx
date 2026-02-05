'use client'

import { type Certification, certificationSchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { useAtom } from 'jotai'
import { Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { certificationsAtom } from '../lib/atoms'

const defaultCertification: Omit<Certification, 'id'> = {
  name: '',
  issuer: '',
  issueDate: '',
  expirationDate: '',
  description: ''
}

export function CertificationsSection() {
  const [certifications, setCertifications] = useAtom(certificationsAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useAppForm({
    validators: { onSubmit: certificationSchema },
    defaultValues: (editingId
      ? certifications.find((cert) => cert.id === editingId)
      : { ...defaultCertification, id: nanoid() }) as Certification,
    onSubmit({ value }) {
      let updatedCertifications: Certification[]
      if (editingId) {
        updatedCertifications = certifications.map((item) =>
          item.id === editingId ? value : item
        )
      } else {
        updatedCertifications = [...certifications, value]
      }

      setCertifications(updatedCertifications)
      setIsAdding(false)
      setEditingId(null)
      form.reset({ ...defaultCertification, id: nanoid() })
    }
  })

  const handleDelete = (id: string) => {
    const updatedCertifications = certifications.filter(
      (item) => item.id !== id
    )
    setCertifications(updatedCertifications)
  }

  const handleEdit = (item: Certification) => {
    setEditingId(item.id)
    setIsAdding(true)
    setTimeout(() => {
      form.reset(item)
    }, 0)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="font-bold text-2xl">Certifications</h2>
        <p className="text-muted-foreground text-sm">Add your certifications</p>
      </div>

      <div className="space-y-4">
        {certifications.length === 0 && !isAdding && (
          <div className="py-8 text-center text-muted-foreground">
            <p>No certifications yet.</p>
          </div>
        )}

        {certifications.map((item) => (
          <div
            className="rounded-lg border p-4 transition-colors hover:border-primary"
            key={item.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-muted-foreground text-sm">{item.issuer}</p>
                <p className="text-muted-foreground text-sm">
                  Issued: {item.issueDate}
                </p>
                {item.expirationDate && (
                  <p className="text-muted-foreground text-sm">
                    Expires: {item.expirationDate}
                  </p>
                )}
                {item.description && (
                  <div
                    className="prose prose-sm mt-2 max-w-none [&_li]:ml-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_ul]:ml-4 [&_ul]:list-disc"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: expected
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
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
            {editingId ? 'Edit' : 'Add'} Certification
          </h3>
          <form.AppField
            children={(field) => (
              <field.Text
                label="Certification Name"
                placeholder="e.g., AWS Certified Solutions Architect"
              />
            )}
            name="name"
          />
          <form.AppField
            children={(field) => (
              <field.Text
                label="Issuer"
                placeholder="e.g., Amazon Web Services"
              />
            )}
            name="issuer"
          />
          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              children={(field) => (
                <field.Text label="Issue Date" placeholder="e.g., Jan 2023" />
              )}
              name="issueDate"
            />
            <form.AppField
              children={(field) => (
                <field.Text
                  label="Expiration Date (optional)"
                  placeholder="e.g., Jan 2026"
                />
              )}
              name="expirationDate"
            />
          </div>
          <form.AppField
            children={(field) => (
              <field.RichText
                description="Optional: Provide context about the certification"
                label="Description (optional)"
                maxLength={1000}
                placeholder="Add details about what you learned or achieved..."
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
                form.reset({ ...defaultCertification, id: nanoid() })
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
          Add Certification
        </Button>
      )}
    </div>
  )
}
