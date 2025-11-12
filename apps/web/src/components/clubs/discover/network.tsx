'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Filter, MessageCircle, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { mockPeople } from '@/data/space-club-data'

const Network = () => {
  const [selectedPerson, setSelectedPerson] = useState<
    (typeof mockPeople)[0] | null
  >(null)
  return (
    <div>
      <div className="mb-6">
        <Input
          className="mb-4"
          placeholder="Search people by name, major, or interests..."
        />
        <div className="mb-4 flex gap-2">
          <Button size="sm" variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Badge className="cursor-pointer" variant="outline">
            Same Major
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Same Year
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Mutual Connections
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mockPeople.map((person) => (
          <Card className="p-6" key={person.id}>
            <div className="mb-4 flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={`/clubs${person.avatar}`} />
                <AvatarFallback>{person.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{person.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {person.major} • {person.year}
                </p>
                <p className="mt-1 text-primary text-xs">
                  {person.mutualConnections} mutual connections
                </p>
              </div>
            </div>
            <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
              {person.bio}
            </p>
            <div className="mb-4 flex flex-wrap gap-1">
              {person.interests.slice(0, 3).map((interest, i) => (
                <Badge
                  className="text-xs"
                  key={i.toString()}
                  variant="secondary"
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" size="sm">
                Connect
              </Button>
              <Button
                onClick={() => setSelectedPerson(person)}
                size="sm"
                variant="outline"
              >
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog
        onOpenChange={() => setSelectedPerson(null)}
        open={!!selectedPerson}
      >
        <DialogContent className="sm:max-w-[600px]">
          {selectedPerson && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/clubs${selectedPerson.avatar}`} />
                    <AvatarFallback>{selectedPerson.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">
                      {selectedPerson.name}
                    </DialogTitle>
                    <p className="text-muted-foreground text-sm">
                      {selectedPerson.major} • {selectedPerson.year}
                    </p>
                    <p className="mt-1 text-primary text-xs">
                      {selectedPerson.mutualConnections} mutual connections
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-sm">About</h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedPerson.bio}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-sm">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPerson.interests.map((interest, i) => (
                      <Badge key={i.toString()} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-sm">
                    Clubs & Societies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPerson.clubs.map((club, i) => (
                      <Badge key={i.toString()} variant="outline">
                        {club}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                  <Button className="flex-1 bg-transparent" variant="outline">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Network
