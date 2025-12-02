'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image as ImageIcon, MapPin, Video as VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { RichTextEditor } from './rich-text-editor'

export const ClubPostPromptCard = () => {
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null)
  const [selectedImageS3Url, setSelectedImageS3Url] = useState<string | null>(
    null
  )
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  const createPostMutation = useMutation(
    orpc.campusFeed.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
        toast.success('Post created successfully!')
        setPostContent('')
        setSelectedImagePreview(null)
        setSelectedImageS3Url(null)
        setPostDialogOpen(false)
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create post')
      }
    })
  )

  const uploadMediaMutation = useMutation(
    orpc.campusFeed.uploadMedia.mutationOptions({
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to upload image')
        setIsUploading(false)
      }
    })
  )

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Data = reader.result as string

      try {
        const result = await uploadMediaMutation.mutateAsync({
          base64Data,
          mediaType: 'image'
        })
        // Use presigned URL for preview
        setSelectedImagePreview(result.url)
        // Store S3 key URL for posting
        setSelectedImageS3Url(result.s3KeyUrl)
        setIsUploading(false)
      } catch {
        // Error handled by mutation
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePost = () => {
    // Strip HTML tags to check if there's actual content
    const textContent = postContent.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      toast.error('Post content cannot be empty')
      return
    }

    createPostMutation.mutate({
      content: postContent,
      imageUrl: selectedImageS3Url || undefined, // Use S3 key URL for storage
      type: 'post',
      visibility: 'public'
    })
  }

  return (
    <>
      <Card
        className="isolate mb-6 cursor-pointer p-4 transition-colors hover:bg-accent/50"
        onClick={() => setPostDialogOpen(true)}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-muted-foreground">
            What's on your mind, {session?.user?.name?.split(' ')[0] || 'there'}
            ?
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <VideoIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
      <Dialog onOpenChange={setPostDialogOpen} open={postDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback>
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  {session?.user?.name || 'User'}
                </div>
                <div className="text-muted-foreground text-xs">Student</div>
              </div>
            </div>
            <RichTextEditor
              content={postContent}
              disabled={createPostMutation.isPending || isUploading}
              onChange={setPostContent}
              placeholder="What's on your mind?"
            />

            {selectedImagePreview && (
              <div className="relative">
                <img
                  alt="Selected"
                  className="w-full rounded-lg"
                  src={selectedImagePreview}
                />
                <Button
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedImagePreview(null)
                    setSelectedImageS3Url(null)
                  }}
                  size="sm"
                  variant="destructive"
                >
                  Remove
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="font-medium text-sm">Add to your post</span>
              <div className="flex gap-2">
                <input
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageSelect}
                  type="file"
                />
                <Button
                  asChild
                  disabled={isUploading}
                  size="icon"
                  variant="ghost"
                >
                  <label className="cursor-pointer" htmlFor="image-upload">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </label>
                </Button>
                <Button disabled size="icon" variant="ghost">
                  <VideoIcon className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button disabled size="icon" variant="ghost">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={
                !postContent.replace(/<[^>]*>/g, '').trim() ||
                createPostMutation.isPending ||
                isUploading
              }
              onClick={handlePost}
            >
              {(() => {
                if (isUploading) return 'Uploading...'
                if (createPostMutation.isPending) return 'Posting...'
                return 'Post'
              })()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ClubPostPromptCard
