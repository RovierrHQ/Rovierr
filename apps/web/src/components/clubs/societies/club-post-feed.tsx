import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Share2
} from 'lucide-react'
import { mockPosts } from '@/data/space-club-data'

const ClubPostFeed = () => {
  return (
    <div>
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card className="isolate p-6" key={post.id}>
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/clubs${post.author.avatar}`} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {post.author.role}
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {post.timestamp}
                  </div>
                </div>
                <p className="mb-4 leading-relaxed">{post.content}</p>
                {post.image && (
                  <img
                    alt="Post content"
                    className="mb-4 w-full rounded-lg"
                    src={`/clubs${post.image}`}
                  />
                )}
                {post.type === 'event' && post.eventDetails && (
                  <Card className="mb-4 bg-accent p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{post.eventDetails.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.eventDetails.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{post.eventDetails.location}</span>
                      </div>
                    </div>
                  </Card>
                )}
                <div className="flex items-center gap-6">
                  <Button className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{post.likes}</span>
                  </Button>
                  <Button className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                  <Button className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </Button>
                  {post.type === 'event' && (
                    <Button className="ml-auto" size="sm">
                      RSVP
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClubPostFeed
