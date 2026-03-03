'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageUploadDialog as SharedImageUploadDialog } from '@web/components/shared/image-upload-dialog'
import api from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import { toast } from 'sonner'

type SocietyImageUploadDialogProps = {
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
      const response = await api.society['']({
        id: organizationId
      }).fields.patch({
        [type]: croppedImage
      })
      return response
    },
    onSuccess: async () => {
      // Invalidate and refetch society queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['society', organizationId]
        }),
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
      const response = await api.society['']({
        id: organizationId
      }).fields.patch({
        [type]: ''
      })
      return response
    },
    onSuccess: async () => {
      // Invalidate and refetch society queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['society', organizationId]
        }),
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
