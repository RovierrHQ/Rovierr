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
import { Textarea } from '@rov/ui/components/textarea'

import {
  LucideComponent as ImageIconComponent,
  MapPin,
  Smile,
  LucideComponent as VideoIconComponent
} from 'lucide-react'
import { useState } from 'react'

export const ClubPostPromptCard = () => {
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [postContent, setPostContent] = useState('')

  return (
    <>
      <Card
        className="mb-6 cursor-pointer p-4 transition-colors hover:bg-accent/50"
        onClick={() => setPostDialogOpen(true)}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={'/clubs/abstract-geometric-shapes.png'} />
            <AvatarFallback>RJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-muted-foreground">
            What's on your mind, Rejoan?
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost">
              <ImageIconComponent className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <VideoIconComponent className="h-5 w-5" />
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
                <AvatarImage src="/abstract-geometric-shapes.png" />
                <AvatarFallback>RJ</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">Rejoan</div>
                <div className="text-muted-foreground text-xs">
                  Computer Science, Year 3
                </div>
              </div>
            </div>
            <Textarea
              className="min-h-[150px] resize-none"
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              value={postContent}
            />
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="font-medium text-sm">Add to your post</span>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost">
                  <ImageIconComponent className="h-5 w-5 text-primary" />
                </Button>
                <Button size="icon" variant="ghost">
                  <VideoIconComponent className="h-5 w-5 text-primary" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Smile className="h-5 w-5 text-primary" />
                </Button>
                <Button size="icon" variant="ghost">
                  <MapPin className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>
            <Button className="w-full" disabled={!postContent.trim()}>
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ClubPostPromptCard
