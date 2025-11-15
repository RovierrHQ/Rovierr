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
import { Separator } from '@rov/ui/components/separator'

function Profile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="johndoe" />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+1 (555) 000-0000" type="tel" />
          </div>

          <Button variant="outline">Send Verification Code</Button>

          <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <div className="space-y-2">
              <Label>Enter Verification Code</Label>
              <p className="text-muted-foreground text-sm">
                We sent a code to {'your phone'}
              </p>
              {/* <OTPInput length={6} onComplete={handleVerifyPhoneOTP} /> */}
            </div>
            <Button size="sm" variant="ghost">
              Resend Code
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Profile
