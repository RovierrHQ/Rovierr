'use client'

import { useParams } from 'next/navigation'
import FormBuilder from '@/components/form/form-builder'

export default function CreateFormPage() {
  const params = useParams()
  const societyId = params.clubID as string

  return <FormBuilder entityId={societyId} entityType="society" />
}
