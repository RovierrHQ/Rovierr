'use client'

import { useParams } from 'next/navigation'
import FormBuilder from '@/components/form/form-builder'

export default function EditFormPage() {
  const params = useParams()
  const societyId = params.clubID as string
  const formId = params.formId as string

  return (
    <FormBuilder entityId={societyId} entityType="society" formId={formId} />
  )
}
