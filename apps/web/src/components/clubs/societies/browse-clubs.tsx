import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { mockClubs } from '@/data/space-club-data'

const BrowseClubs = () => {
  return (
    <div>
      <div className="mb-6">
        <Input className="mb-4" placeholder="Search clubs..." />
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge className="cursor-pointer" variant="default">
            All
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Technology
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Arts
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Sports
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Academic
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mockClubs.map((club, index) => (
          <Card className="p-6" key={index.toString()}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{club.icon}</div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold">{club.name}</h3>
                <div className="mb-3 text-muted-foreground text-sm">
                  {club.members} members • {club.category}
                </div>
                <Button className="w-full" size="sm">
                  Join Club
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default BrowseClubs
