'use client'
import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Bell,
  Calendar,
  Clock,
  Info,
  MapPin,
  MessageCircle,
  Plus,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react'

export default function SocialPage() {
  return (
    <main className="flex-1 px-6 py-8">
      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          <strong>Demonstration purposes only.</strong> This feature is not
          connected to any backend database. The Social Space will help you
          connect with groups, manage group activities, stay updated on
          announcements, track upcoming events, and view recent activity from
          your social connections. All data shown is for demo purposes only.
        </AlertDescription>
      </Alert>

      <div className="mb-8">
        <h2 className="mb-2 font-bold text-3xl text-foreground">Social</h2>
        <p className="text-muted-foreground">
          Connect with your groups and stay updated on activities
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Groups</p>
              <p className="mt-1 font-bold text-3xl text-foreground">8</p>
            </div>
            <Users className="h-8 w-8 text-chart-1" />
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Upcoming Events</p>
              <p className="mt-1 font-bold text-3xl text-foreground">5</p>
            </div>
            <Calendar className="h-8 w-8 text-chart-2" />
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">New Messages</p>
              <p className="mt-1 font-bold text-3xl text-foreground">12</p>
            </div>
            <MessageCircle className="h-8 w-8 text-chart-3" />
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Connections</p>
              <p className="mt-1 font-bold text-3xl text-foreground">47</p>
            </div>
            <UserPlus className="h-8 w-8 text-chart-4" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Groups */}
        <Card className="border-border bg-card p-6 lg:col-span-2" id="groups">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">My Groups</h3>
            <Button className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Join Group
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                  <Users className="h-6 w-6 text-chart-1" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    Football Club
                  </h4>
                  <p className="text-muted-foreground text-xs">24 members</p>
                </div>
              </div>
              <p className="mb-3 text-muted-foreground text-sm">
                Weekly practice sessions and friendly matches
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                <span>Next: Saturday 3:00 PM</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                  <MapPin className="h-6 w-6 text-chart-2" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    Hiking Adventures
                  </h4>
                  <p className="text-muted-foreground text-xs">18 members</p>
                </div>
              </div>
              <p className="mb-3 text-muted-foreground text-sm">
                Explore trails and enjoy nature together
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                <span>Next: Sunday 8:00 AM</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
                  <Users className="h-6 w-6 text-chart-3" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Study Group</h4>
                  <p className="text-muted-foreground text-xs">12 members</p>
                </div>
              </div>
              <p className="mb-3 text-muted-foreground text-sm">
                Collaborative learning and exam preparation
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                <span>Next: Tuesday 6:00 PM</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/10">
                  <MessageCircle className="h-6 w-6 text-chart-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Book Club</h4>
                  <p className="text-muted-foreground text-xs">15 members</p>
                </div>
              </div>
              <p className="mb-3 text-muted-foreground text-sm">
                Monthly book discussions and recommendations
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                <span>Next: Friday 7:00 PM</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                  <Users className="h-6 w-6 text-chart-1" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    Photography Club
                  </h4>
                  <p className="text-muted-foreground text-xs">20 members</p>
                </div>
              </div>
              <p className="mb-3 text-muted-foreground text-sm">
                Share photos and learn photography techniques
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                <span>Next: Wednesday 5:00 PM</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    Volunteer Network
                  </h4>
                  <p className="text-muted-foreground text-xs">32 members</p>
                </div>
              </div>
              <p className="mb-3 text-muted-foreground text-sm">
                Community service and volunteer opportunities
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                <span>Next: Saturday 10:00 AM</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Announcements */}
        <Card className="border-border bg-card p-6" id="announcements">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              Announcements
            </h3>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-3">
              <div className="mb-2 flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4 text-chart-1" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Football Practice Moved
                  </p>
                  <p className="text-muted-foreground text-xs">Football Club</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                This week's practice moved to 4:00 PM due to field maintenance
              </p>
              <p className="mt-2 text-muted-foreground text-xs">2 hours ago</p>
            </div>

            <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-3">
              <div className="mb-2 flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4 text-chart-2" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    New Hiking Trail
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Hiking Adventures
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Discovered an amazing new trail! Details in the group chat
              </p>
              <p className="mt-2 text-muted-foreground text-xs">5 hours ago</p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="mb-2 flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Book Selection Vote
                  </p>
                  <p className="text-muted-foreground text-xs">Book Club</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Vote for next month's book by Wednesday
              </p>
              <p className="mt-2 text-muted-foreground text-xs">1 day ago</p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="mb-2 flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Photo Contest
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Photography Club
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Submit your best shots for the monthly contest
              </p>
              <p className="mt-2 text-muted-foreground text-xs">2 days ago</p>
            </div>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-border bg-card p-6 lg:col-span-2" id="events">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              Upcoming Events
            </h3>
            <Button
              className="gap-2 bg-transparent"
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center rounded-lg bg-chart-1/10 px-3 py-2">
                  <span className="font-medium text-chart-1 text-xs">SAT</span>
                  <span className="font-bold text-2xl text-chart-1">15</span>
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-foreground">
                    Football Match vs City FC
                  </h4>
                  <p className="mb-2 text-muted-foreground text-sm">
                    Football Club
                  </p>
                  <div className="flex flex-wrap gap-3 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>3:00 PM - 5:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Central Sports Complex</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>18 attending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center rounded-lg bg-chart-2/10 px-3 py-2">
                  <span className="font-medium text-chart-2 text-xs">SUN</span>
                  <span className="font-bold text-2xl text-chart-2">16</span>
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-foreground">
                    Mountain Trail Hike
                  </h4>
                  <p className="mb-2 text-muted-foreground text-sm">
                    Hiking Adventures
                  </p>
                  <div className="flex flex-wrap gap-3 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>8:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Blue Ridge Trail</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>12 attending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center rounded-lg bg-chart-3/10 px-3 py-2">
                  <span className="font-medium text-chart-3 text-xs">TUE</span>
                  <span className="font-bold text-2xl text-chart-3">18</span>
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-foreground">
                    Group Study Session
                  </h4>
                  <p className="mb-2 text-muted-foreground text-sm">
                    Study Group
                  </p>
                  <div className="flex flex-wrap gap-3 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>6:00 PM - 9:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Library Room 204</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>8 attending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="border-border bg-card p-6" id="contacts">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              Recent Activity
            </h3>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-1/10">
                <Users className="h-4 w-4 text-chart-1" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm">
                  <span className="font-medium">Sarah</span> joined Football
                  Club
                </p>
                <p className="text-muted-foreground text-xs">30 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10">
                <MessageCircle className="h-4 w-4 text-chart-2" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm">
                  <span className="font-medium">Mike</span> posted in Hiking
                  Adventures
                </p>
                <p className="text-muted-foreground text-xs">1 hour ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-3/10">
                <Calendar className="h-4 w-4 text-chart-3" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm">
                  <span className="font-medium">Emma</span> created a new event
                </p>
                <p className="text-muted-foreground text-xs">3 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-4/10">
                <Users className="h-4 w-4 text-chart-4" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm">
                  <span className="font-medium">Alex</span> joined Book Club
                </p>
                <p className="text-muted-foreground text-xs">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-1/10">
                <MessageCircle className="h-4 w-4 text-chart-1" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm">
                  <span className="font-medium">Lisa</span> commented on your
                  post
                </p>
                <p className="text-muted-foreground text-xs">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
