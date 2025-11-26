---
inclusion: always
---

# TanStack React Form Usage Guide

This document provides guidelines for using TanStack React Form in the Rovierr application.

## Overview

TanStack React Form provides type-safe form handling with built-in validation using Zod schemas. We use a custom wrapper `useAppForm` that integrates with our UI components.

## Basic Form Setup

### Import Required Dependencies

```typescript
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import type z from 'zod'
```

### Create Form with Validation

```typescript
const form = useAppForm({
  validators: { onSubmit: yourZodSchema },
  defaultValues: {
    displayName: '',
    email: '',
    // ... other fields
  } as z.infer<typeof yourZodSchema>,
  onSubmit: async ({ value }) => {
    try {
      await orpc.your.endpoint.call(value)
      toast.success('Success!')
    } catch (error) {
      toast.error(error.message)
    }
  }
})
```


## Form Structure

### Basic Form Template

```typescript
<form
  className="space-y-6"
  onSubmit={(e) => {
    e.preventDefault()
    form.handleSubmit()
  }}
>
  {/* Form fields go here */}

  <Button disabled={form.state.isSubmitting} type="submit">
    {form.state.isSubmitting ? 'Submitting...' : 'Submit'}
  </Button>
</form>
```

## Available Field Components

### Text Input Field

```typescript
<form.AppField
  name="displayName"
  children={(field) => (
    <field.Text
      label="Display Name"
      placeholder="John Doe"
      description="Your name as it appears to others"
    />
  )}
/>
```

### Select Field

```typescript
<form.AppField
  name="universityId"
  children={(field) => (
    <field.Select
      label="University"
      placeholder="Select your university"
      options={[
        { label: 'Stanford University', value: 'stanford' },
        { label: 'MIT', value: 'mit' }
      ]}
    />
  )}
/>
```

### Textarea Field

```typescript
<form.AppField
  name="bio"
  children={(field) => (
    <field.Textarea
      label="Bio"
      placeholder="Tell us about yourself..."
      rows={4}
    />
  )}
/>
```


## Complete Example

```typescript
'use client'

import { useAppForm } from '@rov/ui/components/form/index'
import { Button } from '@rov/ui/components/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { profileUpdateSchema } from '@rov/orpc-contracts/user/profile'
import type z from 'zod'

export function ProfileForm() {
  const queryClient = useQueryClient()

  const form = useAppForm({
    validators: { onSubmit: profileUpdateSchema },
    defaultValues: {
      name: '',
      username: '',
      bio: '',
      website: ''
    } as z.infer<typeof profileUpdateSchema>,
    onSubmit: async ({ value }) => {
      try {
        await orpc.user.profile.update.call(value)
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
        toast.success('Profile updated successfully')
      } catch (error) {
        toast.error(error.message || 'Failed to update profile')
      }
    }
  })

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField
        name="name"
        children={(field) => (
          <field.Text label="Full Name" placeholder="John Doe" />
        )}
      />

      <form.AppField
        name="username"
        children={(field) => (
          <field.Text
            label="Username"
            placeholder="johndoe"
            description="Your unique username"
          />
        )}
      />

      <form.AppField
        name="bio"
        children={(field) => (
          <field.Textarea
            label="Bio"
            placeholder="Tell us about yourself..."
            rows={4}
          />
        )}
      />

      <form.AppField
        name="website"
        children={(field) => (
          <field.Text
            label="Website"
            type="url"
            placeholder="https://yourwebsite.com"
          />
        )}
      />

      <Button disabled={form.state.isSubmitting} type="submit">
        {form.state.isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
```


## Form State Management

### Accessing Form State

```typescript
// Check if form is submitting
const isSubmitting = form.state.isSubmitting

// Check if form is valid
const isValid = form.state.isValid

// Get form values
const values = form.state.values

// Check if form is dirty (has changes)
const isDirty = form.state.isDirty
```

### Programmatic Form Control

```typescript
// Reset form to default values
form.reset()

// Set field value programmatically
form.setFieldValue('name', 'New Name')

// Validate form manually
form.validateAllFields('submit')
```

## Dynamic Options from API

```typescript
const { data: universities } = useQuery(orpc.university.list.queryOptions())

<form.AppField
  name="universityId"
  children={(field) => (
    <field.Select
      label="University"
      placeholder="Select your university"
      options={
        universities?.universities?.map((uni) => ({
          label: `${uni.name} - ${uni.city}`,
          value: uni.id
        })) ?? []
      }
    />
  )}
/>
```

## Integration with ORPC Mutations

```typescript
const updateMutation = useMutation(
  orpc.user.profile.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      toast.success('Updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
)

const form = useAppForm({
  validators: { onSubmit: schema },
  defaultValues: { /* ... */ },
  onSubmit: async ({ value }) => {
    await updateMutation.mutateAsync(value)
  }
})
```


## Field Validation

### Built-in Validation

Validation is handled automatically through Zod schemas:

```typescript
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, - and _'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
})
```

### Error Display

Errors are automatically displayed by field components when:
- Field has been touched (`isTouched`)
- Field is invalid (`!isValid`)

```typescript
// Errors are shown automatically in field components
<form.AppField
  name="username"
  children={(field) => (
    <field.Text label="Username" placeholder="johndoe" />
  )}
/>
// Error message appears below input if validation fails
```

## Best Practices

1. **Always use Zod schemas for validation** - Define schemas in ORPC contracts when possible

2. **Use type inference** - Use `z.infer<typeof schema>` for type safety:
   ```typescript
   defaultValues: {
     name: ''
   } as z.infer<typeof profileSchema>
   ```

3. **Handle loading states** - Always disable submit button during submission:
   ```typescript
   <Button disabled={form.state.isSubmitting} type="submit">
     {form.state.isSubmitting ? 'Saving...' : 'Save'}
   </Button>
   ```

4. **Provide user feedback** - Use toast notifications:
   ```typescript
   onSubmit: async ({ value }) => {
     try {
       await mutation(value)
       toast.success('Success!')
     } catch (error) {
       toast.error(error.message)
     }
   }
   ```

5. **Invalidate queries after mutations** - Keep data fresh:
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
   ```

6. **Use descriptive labels and placeholders**:
   ```typescript
   <field.Text
     label="University Email"
     placeholder="student@university.edu"
     description="Use your official university email"
   />
   ```

7. **Prevent default form submission**:
   ```typescript
   <form onSubmit={(e) => {
     e.preventDefault()
     form.handleSubmit()
   }}>
   ```


## Common Patterns

### Form with Conditional Fields

```typescript
const showAdvanced = form.state.values.showAdvanced

<form.AppField
  name="showAdvanced"
  children={(field) => (
    <field.Checkbox label="Show advanced options" />
  )}
/>

{showAdvanced && (
  <form.AppField
    name="advancedOption"
    children={(field) => (
      <field.Text label="Advanced Option" />
    )}
  />
)}
```

### Multi-Step Forms

```typescript
const [step, setStep] = useState(1)

const form = useAppForm({
  validators: { onSubmit: schema },
  defaultValues: { /* ... */ },
  onSubmit: async ({ value }) => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      await submitData(value)
    }
  }
})

return (
  <form onSubmit={(e) => {
    e.preventDefault()
    form.handleSubmit()
  }}>
    {step === 1 && <Step1Fields form={form} />}
    {step === 2 && <Step2Fields form={form} />}
    {step === 3 && <Step3Fields form={form} />}

    <Button type="submit">
      {step < 3 ? 'Next' : 'Submit'}
    </Button>
  </form>
)
```

### Form with File Upload

```typescript
<form.AppField
  name="profileImage"
  children={(field) => (
    <div>
      <label>Profile Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            field.handleChange(file)
          }
        }}
      />
    </div>
  )}
/>
```

## Troubleshooting

### Form not submitting

❌ **Wrong:**
```typescript
<form onSubmit={form.handleSubmit}>
```

✅ **Correct:**
```typescript
<form onSubmit={(e) => {
  e.preventDefault()
  form.handleSubmit()
}}>
```

### Type errors with defaultValues

❌ **Wrong:**
```typescript
defaultValues: {
  name: ''
}
```

✅ **Correct:**
```typescript
defaultValues: {
  name: ''
} as z.infer<typeof schema>
```

### Field not updating

Make sure you're using the field component pattern:

✅ **Correct:**
```typescript
<form.AppField
  name="fieldName"
  children={(field) => (
    <field.Text label="Label" />
  )}
/>
```

### Validation not working

Ensure your schema is passed to validators:

✅ **Correct:**
```typescript
const form = useAppForm({
  validators: { onSubmit: yourZodSchema },
  // ...
})
```
