import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { mockClubs } from '@/data/space-club-data'

const MyClubPage = () => {
  const myClubs = mockClubs.slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-semibold text-2xl sm:text-3xl">My Clubs</h1>

      {myClubs.length === 0 ? (
        <p className="text-muted-foreground">
          You haven't joined any clubs yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myClubs.map((club, index) => (
            <Card
              className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md"
              key={index.toString()}
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="text-4xl">{club.icon}</div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-base sm:text-lg">
                    {club.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {club.members} members • {club.category}
                  </p>
                </div>
              </div>
              <Button className="mt-auto w-full" size="sm">
                View Club
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyClubPage
