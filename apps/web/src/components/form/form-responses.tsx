import { Card } from '@rov/ui/components/card'
import { FileText } from 'lucide-react'

export function FormResponses() {
  return (
    <Card className="p-12">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-xl">No responses yet</h3>
          <p className="mx-auto max-w-md text-pretty text-muted-foreground">
            Once your form is published and people start submitting responses,
            they will appear here
          </p>
        </div>
      </div>
    </Card>
  )
}
