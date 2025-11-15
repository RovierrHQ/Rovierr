import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { mockEvents } from '@/data/space-club-data'

const ClubEvents = () => {
  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex gap-2">
          <Button size="sm" variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Map View
          </Button>
          <Button size="sm" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {mockEvents.map((event, index) => (
          <Card className="p-6" key={index.toString()}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-lg">{event.title}</h3>
                <div className="mb-4 flex flex-wrap gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm">Interested</Button>
                <Button size="sm" variant="outline">
                  Going
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClubEvents
