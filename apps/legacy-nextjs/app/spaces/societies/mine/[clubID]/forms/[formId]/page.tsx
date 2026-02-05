'use client'

import FormBuilder from '@web/components/form/form-builder'
import { useParams } from 'next/navigation'

export default function EditFormPage() {
  const params = useParams()
  const societyId = params.clubID as string
  const formId = params.formId as string

  return (
    <FormBuilder entityId={societyId} entityType="society" formId={formId} />
  )
}
