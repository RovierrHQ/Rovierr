'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'

import { redirect } from 'next/navigation'
import ProfileHeader from '@/components/profile/header'
import { authClient } from '@/lib/auth-client'

export default function ProfilePage() {
  const { data, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <div className="mx-auto max-w-5xl px-4 py-6">
        <ProfileHeader />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Tabs className="w-full" defaultValue="about">
          <TabsList className="mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          {/*<TabsContent className="space-y-6" value="about">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold text-xl">Bio</h2>
              {data.user.bio ? (
                <p className="text-muted-foreground leading-relaxed">
                  {data.user.bio}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No bio added yet.
                </p>
              )}
            </div>

            {data.user.showEmail && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 font-semibold text-xl">Contact</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    className="transition-colors hover:text-foreground"
                    href={`mailto:${data.user.email}`}
                  >
                    {data.user.email}
                  </a>
                </div>
              </div>
            )}
          </TabsContent>*/}

          {/* Academic Tab */}
          <TabsContent className="space-y-6" value="academic">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold text-xl">Education</h2>
              {/*<div className="space-y-4">
                {data.user.university && (
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">University</span>
                    </div>
                    <p className="ml-7 text-muted-foreground">
                      {data.user.university.name}
                    </p>
                  </div>
                )}

                {data.user.major && (
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Major</span>
                    </div>
                    <p className="ml-7 text-muted-foreground">
                      {data.user.major.name}
                    </p>
                  </div>
                )}

                {data.user.graduationYear && (
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Graduation Year</span>
                    </div>
                    <p className="ml-7 text-muted-foreground">
                      {data.user.graduationYear}
                    </p>
                  </div>
                )}

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">GPA</span>
                  </div>
                  <p className="ml-7 text-muted-foreground">
                    {data.user.gpa?.toFixed(2)} / 4.0
                  </p>
                </div>
              </div>*/}
            </div>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent className="space-y-6" value="social">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold text-xl">Social Profiles</h2>
              {/*{data.user.showSocialLinks ? (
                <div className="space-y-4">
                  {data.user.linkedinUrl && (
                    <a
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                      href={data.user.linkedinUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                      <div>
                        <p className="font-medium">LinkedIn</p>
                        <p className="text-muted-foreground text-sm">
                          {data.user.linkedinUrl}
                        </p>
                      </div>
                    </a>
                  )}

                  {data.user.githubUrl && (
                    <a
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                      href={data.user.githubUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Github className="h-5 w-5" />
                      <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-muted-foreground text-sm">
                          {data.user.githubUrl}
                        </p>
                      </div>
                    </a>
                  )}

                  {data.user.personalWebsite && (
                    <a
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                      href={data.user.personalWebsite}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Globe className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Personal Website</p>
                        <p className="text-muted-foreground text-sm">
                          {data.user.personalWebsite}
                        </p>
                      </div>
                    </a>
                  )}

                  {!(
                    data.user.linkedinUrl ||
                    data.user.githubUrl ||
                    data.user.personalWebsite
                  ) && (
                    <p className="text-muted-foreground italic">
                      No social links added yet.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Social links are hidden by this user.
                </p>
              )}*/}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
