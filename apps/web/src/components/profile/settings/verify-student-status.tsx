'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Separator } from '@rov/ui/components/separator'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Shield, XCircle } from 'lucide-react'
import { orpc } from '@/utils/orpc'

function VerifyStudentStatus() {
  const { data } = useQuery(orpc.user.profileInfo.queryOptions())
  const studentVerified = data?.studentStatusVerified
  useQuery(orpc.university.list.queryOptions())

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Verification</CardTitle>
            <CardDescription>
              Verify your student status to access more features
            </CardDescription>
          </div>
          {studentVerified ? (
            <Badge className="gap-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">
              <CheckCircle2 className="size-3.5" />
              Verified
            </Badge>
          ) : (
            <Badge className="gap-1.5" variant="secondary">
              <XCircle className="size-3.5" />
              Not Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!studentVerified && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Shield className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">
              Verify Your Student Status
            </h3>
            <p className="mb-6 max-w-md text-muted-foreground text-sm">
              Get access to student exclusive features and more by verifying
              your enrollment
            </p>
            <Button>Start Verification</Button>
          </div>
        )}

        {!studentVerified && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select
                  onValueChange={() => {
                    // TODO: handle university selection
                  }}
                  value={''}
                >
                  <SelectTrigger id="university">
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stanford">
                      Stanford University
                    </SelectItem>
                    <SelectItem value="mit">
                      Massachusetts Institute of Technology
                    </SelectItem>
                    <SelectItem value="harvard">Harvard University</SelectItem>
                    <SelectItem value="berkeley">UC Berkeley</SelectItem>
                    <SelectItem value="oxford">University of Oxford</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  onChange={(_e) => {
                    // TODO: handle start date change
                  }}
                  type="date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university-email">University Email</Label>
                <Input
                  id="university-email"
                  onChange={(_e) => {
                    // TODO: handle email change
                  }}
                  placeholder="student@university.edu"
                  type="email"
                />
              </div>

              <Button className="w-full">Send Verification Code</Button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter Verification Code</Label>
                  <p className="text-muted-foreground text-sm">
                    We sent a code to
                  </p>
                  {/* <OTPInput length={6} onComplete={handleVerifyOTP} /> */}
                </div>
                <Button size="sm" variant="ghost">
                  Resend Code
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>University ID (Front Side)</Label>
                <p className="mb-2 text-muted-foreground text-sm">
                  Upload a clear photo of your student ID
                </p>
                {/* <FileUpload
                        accept="image/*"
                        onChange={setIdDocument}
                        value={idDocument}
                      /> */}
              </div>
            </div>
          </div>
        )}

        {studentVerified && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-green-500/10 p-4">
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">
              Student Status Verified
            </h3>
            <p className="text-muted-foreground text-sm">
              You now have access to all student benefits and discounts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default VerifyStudentStatus
