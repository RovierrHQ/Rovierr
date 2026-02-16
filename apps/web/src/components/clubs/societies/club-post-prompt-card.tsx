import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { Switch } from '@rov/ui/components/switch'
import { useQueryClient } from '@tanstack/react-query'
import api, { useMutation } from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import {
  Calendar,
  Image as ImageIcon,
  MapPin,
  Video as VideoIcon
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const ClubPostPromptCard = () => {
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [isEventPost, setIsEventPost] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  const resetForm = () => {
    setPostContent('')
    setIsEventPost(false)
    setEventDate('')
    setEventTime('')
    setEventLocation('')
    setPostDialogOpen(false)
  }

  const createPostMutation = useMutation(api['campus-feed'].posts.post, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
      toast.success('Post created successfully!')
      resetForm()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create post'
      )
    }
  })

  const createEventMutation = useMutation(
    api['campus-feed'].posts.events.post,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campus-feed', 'posts'] })
        toast.success('Event post created successfully!')
        resetForm()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create event post'
        )
      }
    }
  )

  const handlePost = () => {
    if (!postContent.trim()) {
      toast.error('Post content cannot be empty')
      return
    }

    if (isEventPost) {
      if (!(eventDate && eventTime && eventLocation)) {
        toast.error('Please fill in all event details')
        return
      }

      createEventMutation.mutate({
        content: postContent,
        type: 'event',
        visibility: 'public',
        eventDate,
        eventTime,
        location: eventLocation
      })
    } else {
      createPostMutation.mutate({
        content: postContent,
        type: 'post',
        visibility: 'public'
      })
    }
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

            {/* Event Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <Label className="cursor-pointer" htmlFor="event-toggle">
                  Create Event Post
                </Label>
              </div>
              <Switch
                checked={isEventPost}
                id="event-toggle"
                onCheckedChange={setIsEventPost}
              />
            </div>

            {/* Event Fields */}
            {isEventPost && (
              <div className="space-y-3 rounded-lg border border-border bg-accent/50 p-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Event Date</Label>
                  <Input
                    id="event-date"
                    onChange={(e) => setEventDate(e.target.value)}
                    type="date"
                    value={eventDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Event Time</Label>
                  <Input
                    id="event-time"
                    onChange={(e) => setEventTime(e.target.value)}
                    type="time"
                    value={eventTime}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Enter event location"
                    value={eventLocation}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="post-content">Content</Label>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  createPostMutation.isPending || createEventMutation.isPending
                }
                id="post-content"
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                value={postContent}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="font-medium text-sm">Add to your post</span>
              <div className="flex gap-2">
                <Button disabled size="icon" variant="ghost">
                  <ImageIcon className="h-5 w-5 text-primary" />
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
                !postContent.trim() ||
                createPostMutation.isPending ||
                createEventMutation.isPending
              }
              onClick={handlePost}
            >
              {createPostMutation.isPending || createEventMutation.isPending
                ? 'Posting...'
                : isEventPost
                  ? 'Create Event'
                  : 'Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ClubPostPromptCard
