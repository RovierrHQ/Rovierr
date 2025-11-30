'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Download, Loader2, Printer, QrCode } from 'lucide-react'
import { useRef, useState } from 'react'
import QRCodeReact from 'react-qr-code'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface QRCodeDisplayProps {
  societyId: string
  societySlug: string
}

type QRSize = 256 | 512 | 1024

export const QRCodeDisplay = ({
  societyId,
  societySlug
}: QRCodeDisplayProps) => {
  const [size, setSize] = useState<QRSize>(512)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  // Fetch QR code data
  const { data: qrData } = useQuery(
    orpc.societyRegistration.qrCode.generate.queryOptions({
      input: { societyId, format: 'png', size }
    })
  )

  const registrationUrl = qrData?.registrationUrl || null

  // Generate printable QR code mutation
  const generatePrintableMutation = useMutation(
    orpc.societyRegistration.qrCode.generatePrintable.mutationOptions({
      onSuccess: (data) => {
        // Open printable HTML in new window
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(data.html)
          printWindow.document.close()
          printWindow.focus()
          // Trigger print dialog after a short delay
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }
        toast.success('Opening print preview...')
      },
      onError: () => {
        toast.error('Failed to generate printable QR code')
      }
    })
  )

  const handleDownload = () => {
    if (!(qrCodeRef.current && registrationUrl)) {
      toast.error('QR code not available')
      return
    }

    // Get the SVG element
    const svg = qrCodeRef.current.querySelector('svg')
    if (!svg) {
      toast.error('QR code not found')
      return
    }

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8'
    })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create download link
    const link = document.createElement('a')
    link.href = svgUrl
    link.download = `${societySlug}-registration-qr.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(svgUrl)
    toast.success('QR code downloaded!')
  }

  const handlePrint = () => {
    generatePrintableMutation.mutate({
      societyId
    })
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5" />
        <h2 className="font-semibold text-lg">Registration QR Code</h2>
      </div>

      <p className="mb-6 text-muted-foreground text-sm">
        Generate a QR code for your registration page. Share it on posters,
        social media, or at events to make it easy for students to join.
      </p>

      <div className="space-y-6">
        {/* QR Code Options */}
        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="size">
            Size
          </label>
          <Select
            onValueChange={(value) => setSize(Number(value) as QRSize)}
            value={String(size)}
          >
            <SelectTrigger className="w-full sm:w-48" id="size">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="256">256x256 (Small)</SelectItem>
              <SelectItem value="512">512x512 (Medium)</SelectItem>
              <SelectItem value="1024">1024x1024 (Large)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* QR Code Display */}
        {registrationUrl && (
          <div className="space-y-4">
            <div
              className="flex justify-center rounded-lg border bg-white p-6"
              ref={qrCodeRef}
            >
              <QRCodeReact
                size={Math.min(size, 400)}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={registrationUrl}
              />
            </div>

            {/* Registration URL */}
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 font-medium text-sm">Registration URL:</p>
              <code className="block break-all text-sm">{registrationUrl}</code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <Button
                disabled={generatePrintableMutation.isPending}
                onClick={handlePrint}
                variant="outline"
              >
                {generatePrintableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Print QR Code
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
