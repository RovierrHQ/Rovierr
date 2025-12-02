'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImageUploadDialog as SharedImageUploadDialog } from '@/components/shared/image-upload-dialog'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

interface SocietyImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'logo' | 'banner'
  currentImageUrl?: string | null
  organizationId: string
}

export function SocietyImageUploadDialog({
  open,
  onOpenChange,
  type,
  currentImageUrl,
  organizationId
}: SocietyImageUploadDialogProps) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async (croppedImage: string) => {
      if (type === 'banner') {
        // Update banner using ORPC
        await orpc.society.updateFields.call({
          organizationId,
          data: {
            banner: croppedImage
          }
        })
      } else {
        // Update logo using ORPC updateFields
        await orpc.society.updateFields.call({
          organizationId,
          data: {
            logo: croppedImage
          }
        })
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch society queries using ORPC query options
      const queryOptions = orpc.society.getById.queryOptions({
        input: { id: organizationId }
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryOptions.queryKey }),
        queryClient.refetchQueries({ queryKey: queryOptions.queryKey }),
        queryClient.invalidateQueries({ queryKey: ['society'] }),
        // Invalidate Better-Auth organizations list (logo is stored there)
        authClient.getSession({ query: { disableCookieCache: true } })
      ])
      toast.success(
        `${type === 'logo' ? 'Logo' : 'Banner'} updated successfully`
      )
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to update ${type}`)
    }
  })

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (type === 'banner') {
        await orpc.society.updateFields.call({
          organizationId,
          data: {
            banner: ''
          }
        })
      } else {
        // Remove logo
        await orpc.society.updateFields.call({
          organizationId,
          data: {
            logo: ''
          }
        })
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch society queries using ORPC query options
      const queryOptions = orpc.society.getById.queryOptions({
        input: { id: organizationId }
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryOptions.queryKey }),
        queryClient.refetchQueries({ queryKey: queryOptions.queryKey }),
        queryClient.invalidateQueries({ queryKey: ['society'] }),
        // Invalidate Better-Auth organizations list (logo is stored there)
        authClient.getSession({ query: { disableCookieCache: true } })
      ])
      toast.success(
        `${type === 'logo' ? 'Logo' : 'Banner'} removed successfully`
      )
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to remove ${type}`)
    }
  })

  const handleSave = async (croppedImage: string) => {
    await updateMutation.mutateAsync(croppedImage)
  }

  const handleRemove = async () => {
    await removeMutation.mutateAsync()
  }

  return (
    <SharedImageUploadDialog
      currentImageUrl={currentImageUrl}
      description={
        type === 'logo'
          ? 'Upload and crop your society logo (square)'
          : 'Upload and position your banner image (4:1 ratio)'
      }
      onOpenChange={onOpenChange}
      onRemove={handleRemove}
      onSave={handleSave}
      open={open}
      title={type === 'logo' ? 'Update Society Logo' : 'Update Society Banner'}
      type={type === 'logo' ? 'profile' : 'banner'}
    />
  )
}
