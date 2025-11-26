---
inclusion: always
---

# ORPC with React Query Usage Guide

This document provides guidelines for using ORPC (Type-safe RPC) with React Query in the Rovierr application.

## Overview

ORPC provides type-safe client-server communication with automatic TypeScript inference. It integrates seamlessly with React Query for data fetching and mutations.

## Query Usage

### Basic Query with `queryOptions`

Use `.queryOptions()` to create options for queries. This provides full type safety and integrates with React Query hooks.

```typescript
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/utils/orpc'

// Simple query
const { data, isLoading, error } = useQuery(
  orpc.user.profile.details.queryOptions()
)

// Query with parameters
const { data } = useQuery(
  orpc.user.profile.activity.queryOptions({
    limit: 50,
    offset: 0
  })
)
```

### Infinite Queries

For paginated data with infinite scroll:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'
import { orpc } from '@/utils/orpc'

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['user', 'profile', 'activity'],
  queryFn: async ({ pageParam = 0 }) => {
    const client = orpc.user.profile.activity
    return await client({ limit: 50, offset: pageParam })
  },
  getNextPageParam: (lastPage, pages) => {
    if (lastPage.hasMore) {
      return pages.length * 50
    }
    return undefined
  },
  initialPageParam: 0
})
```

### Custom Query Options

You can add additional React Query options:

```typescript
const { data } = useQuery({
  ...orpc.user.profile.details.queryOptions(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false
})
```

## Mutation Usage

### Basic Mutation with `mutationOptions`

Use `.mutationOptions()` to create options for mutations:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/utils/orpc'
import { toast } from 'sonner'

const queryClient = useQueryClient()

const updateMutation = useMutation(
  orpc.user.profile.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    }
  })
)

// Use the mutation
updateMutation.mutate({
  name: 'John Doe',
  bio: 'Software Engineer'
})
```

### Mutation with Loading States

```typescript
const mutation = useMutation(
  orpc.user.profile.update.mutationOptions()
)

// In your component
<Button
  onClick={() => mutation.mutate(formData)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? 'Saving...' : 'Save Changes'}
</Button>
```

### Optimistic Updates

```typescript
const updateMutation = useMutation(
  orpc.user.profile.update.mutationOptions({
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', 'profile'] })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['user', 'profile'])

      // Optimistically update
      queryClient.setQueryData(['user', 'profile'], (old: any) => ({
        ...old,
        ...newData
      }))

      return { previousData }
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', 'profile'], context?.previousData)
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    }
  })
)
```

## Direct Client Calls

For non-React contexts or server components, you can call ORPC clients directly:

```typescript
// Direct call (returns a Promise)
  await orpc.user.profile.update.call({...your data})
  or
  await client.user.onboarding.submit(value)
```

## Better Auth Integration

Better Auth methods are accessed through `authClient`:

```typescript
import { authClient } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'

// Session data
const { data: session } = authClient.useSession()

// List organizations
const { data: organizations } = useQuery({
  queryFn: async () => {
    const result = await authClient.organization.listOrganizations()
    return result
  },
  queryKey: ['organizations', 'list']
})
```

## Error Handling

### Query Errors

```typescript
const { data, error, isError } = useQuery(
  orpc.user.profile.details.queryOptions()
)

if (isError) {
  return <div>Error: {error.message}</div>
}
```

### Mutation Errors

```typescript
const mutation = useMutation(
  orpc.user.profile.update.mutationOptions({
    onError: (error: Error) => {
      if (error.message.includes('USERNAME_TAKEN')) {
        toast.error('Username is already taken')
      } else {
        toast.error('Failed to update profile')
      }
    }
  })
)
```

## Best Practices

1. **Always use `queryOptions` and `mutationOptions`** - These provide full type safety and proper integration with React Query

2. **Invalidate queries after mutations** - Use `queryClient.invalidateQueries()` to refresh data after updates

3. **Use proper query keys** - Consistent query keys help with caching and invalidation:
   ```typescript
   ['user', 'profile', 'details']
   ['user', 'profile', 'activity', { limit: 50 }]
   ```

4. **Handle loading and error states** - Always provide feedback to users:
   ```typescript
   if (isLoading) return <Spinner />
   if (error) return <ErrorMessage error={error} />
   ```

5. **Use toast notifications** - Provide feedback for mutations:
   ```typescript
   import { toast } from 'sonner'

   onSuccess: () => toast.success('Updated successfully')
   onError: (error) => toast.error(error.message)
   ```