'use client'

import FormBuilder from '@web/components/form/form-builder'
import { useParams } from 'next/navigation'

export default function CreateFormPage() {
  const params = useParams()
  const societyId = params.clubID as string

  return <FormBuilder entityId={societyId} entityType="society" />
}
