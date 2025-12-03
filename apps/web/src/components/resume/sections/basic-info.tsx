'use client'

import { type BasicInfo, basicInfoSchema } from '@rov/orpc-contracts'
import { useAppForm } from '@rov/ui/components/form/index'
import { useStore } from '@tanstack/react-form'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { basicInfoAtom, isDirtyAtom } from '../lib/atoms'

// ============================================================================
// Schema
// ============================================================================

const defaultBasicInfo: BasicInfo = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: ''
}

// ============================================================================
// Component
// ============================================================================

export function BasicInfoSection() {
  const [basicInfo, setBasicInfo] = useAtom(basicInfoAtom)
  const setIsDirty = useSetAtom(isDirtyAtom)
  const previousValuesRef = useRef<string>('')

  const form = useAppForm({
    validators: { onSubmit: basicInfoSchema },
    defaultValues: basicInfo || defaultBasicInfo
  })

  const formValues = useStore(form.store, (state) => state.values)

  // Update atom when form changes (with ref to prevent infinite loops)
  useEffect(() => {
    if (
      formValues.name &&
      formValues.email &&
      formValues.phone &&
      formValues.location
    ) {
      const currentValues = JSON.stringify(formValues)

      // Only update if values actually changed
      if (currentValues !== previousValuesRef.current) {
        previousValuesRef.current = currentValues
        setBasicInfo(formValues as BasicInfo)
        setIsDirty(true)
      }
    }
  }, [formValues, setBasicInfo, setIsDirty])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Basic Information</h2>
          <p className="text-muted-foreground text-sm">
            Your contact information and professional summary
          </p>
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField
          children={(field) => (
            <field.Text
              description="Your full name as it should appear on your resume"
              label="Full Name"
              placeholder="John Doe"
            />
          )}
          name="name"
        />

        <form.AppField
          children={(field) => (
            <field.Text
              description="Your professional email address"
              label="Email"
              placeholder="john.doe@example.com"
              type="email"
            />
          )}
          name="email"
        />

        <form.AppField
          children={(field) => (
            <field.Text
              description="Your contact phone number"
              label="Phone"
              placeholder="+1 (555) 123-4567"
              type="tel"
            />
          )}
          name="phone"
        />

        <form.AppField
          children={(field) => (
            <field.Text
              description="Your city and state/country"
              label="Location"
              placeholder="San Francisco, CA"
            />
          )}
          name="location"
        />

        <form.AppField
          children={(field) => (
            <field.TextArea
              description="Optional summary of your experience and skills"
              label="Professional Summary"
              placeholder="Brief overview of your professional background..."
              rows={4}
            />
          )}
          name="summary"
        />
      </form>
    </div>
  )
}
