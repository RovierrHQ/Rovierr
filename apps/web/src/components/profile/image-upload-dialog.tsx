'use client'

import type { Treaty } from '@elysiajs/eden'
import { useQueryClient } from '@tanstack/react-query'
import { ImageUploadDialog as SharedImageUploadDialog } from '@web/components/shared/image-upload-dialog'
import api, { useMutation } from '@web/lib/api-client'
import { produce } from 'immer'
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
    (data: { image?: string; bannerImage?: string }) =>
      api.user.profile.update.put(data),
    {
      onSuccess: (res) => {
        // Update profile cache with Immer
        queryClient.setQueryData<
          Treaty.Data<typeof api.user.profile.details.get>
        >(['user', 'profile', 'details'], (old) => {
          if (!old) return old
          return produce(old, (draft) => {
            draft.image = res.user.image
            draft.bannerImage = res.user.bannerImage
          })
        })
        toast.success(
          `${type === 'profile' ? 'Profile picture' : 'Banner'} updated successfully`
        )
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to update image')
      }
    }
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
