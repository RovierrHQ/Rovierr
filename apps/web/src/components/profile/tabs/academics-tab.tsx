'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Calendar, CheckCircle, GraduationCap } from 'lucide-react'
import { orpc } from '@/utils/orpc'

export function AcademicsTab() {
  const { data: academicData, isLoading } = useQuery(
    orpc.user.profile.academic.queryOptions()
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!academicData || academicData.enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">
              No Academic Information
            </h3>
            <p className="text-muted-foreground text-sm">
              Complete your onboarding to add your academic information
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Program Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {academicData.enrollments.map((enrollment) => (
              <div
                className={`rounded-lg border p-4 ${
                  enrollment.isPrimary
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                key={enrollment.id}
              >
                <div className="flex items-start gap-4">
                  {/* University Logo */}
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage
                      alt={enrollment.university.name}
                      src={enrollment.university.logo ?? ''}
                    />
                    <AvatarFallback className="rounded-lg">
                      {enrollment.university.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Enrollment Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {enrollment.program.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {enrollment.university.name}
                        </p>
                      </div>
                      {enrollment.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>

                    {/* Program Details */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        {enrollment.program.degreeLevel}
                      </Badge>
                      <Badge variant="outline">{enrollment.program.code}</Badge>
                      {enrollment.studentStatusVerified ? (
                        <Badge className="bg-green-500/10 text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          className="bg-yellow-500/10 text-yellow-600"
                          variant="destructive"
                        >
                          Pending Verification
                        </Badge>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                      {enrollment.startedOn && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Started {enrollment.startedOn.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {enrollment.graduatedOn && (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>
                            Graduated{' '}
                            {enrollment.graduatedOn.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {!enrollment.graduatedOn && enrollment.startedOn && (
                        <div className="flex items-center gap-1">
                          <span className="text-primary">
                            Currently Enrolled
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Total Programs
              </p>
              <p className="font-bold text-xl sm:text-2xl">
                {academicData.enrollments.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Verified
              </p>
              <p className="font-bold text-xl sm:text-2xl">
                {
                  academicData.enrollments.filter(
                    (e) => e.studentStatusVerified
                  ).length
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-muted-foreground text-xs sm:text-sm">Active</p>
              <p className="font-bold text-xl sm:text-2xl">
                {academicData.enrollments.filter((e) => !e.graduatedOn).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
