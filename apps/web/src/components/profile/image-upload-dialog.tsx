'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageUploadDialog as SharedImageUploadDialog } from '@web/components/shared/image-upload-dialog'
import { authClient } from '@web/lib/auth-client'
import { orpc } from '@web/utils/orpc'
import { toast } from 'sonner'

type ImageUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'profile' | 'banner'
  currentImageUrl?: string | null
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  type,
  currentImageUrl
}: ImageUploadDialogProps) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation(
    orpc.user.profile.update.mutationOptions({
      onSuccess: async () => {
        // Invalidate profile queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
          queryClient.invalidateQueries({
            queryKey: orpc.user.profile.details.queryOptions().queryKey
          }),
          authClient.getSession({ query: { disableCookieCache: true } })
        ])
        toast.success(
          `${type === 'profile' ? 'Profile picture' : 'Banner'} updated successfully`
        )
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update image')
      }
    })
  )

  const handleSave = async (croppedImage: string) => {
    await updateMutation.mutateAsync({
      [type === 'profile' ? 'image' : 'bannerImage']: croppedImage
    })
  }

  const handleRemove = async () => {
    await updateMutation.mutateAsync({
      [type === 'profile' ? 'image' : 'bannerImage']: ''
    })
  }

  return (
    <SharedImageUploadDialog
      currentImageUrl={currentImageUrl}
      onOpenChange={onOpenChange}
      onRemove={handleRemove}
      onSave={handleSave}
      open={open}
      type={type}
    />
  )
}
