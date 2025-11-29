'use client'

import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Slider } from '@rov/ui/components/slider'
import { Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { Area, Point } from 'react-easy-crop'
import Cropper from 'react-easy-crop'
import { toast } from 'sonner'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'profile' | 'banner'
  currentImageUrl?: string | null
  onSave: (croppedImage: string) => Promise<void>
  onRemove?: () => Promise<void>
  title?: string
  description?: string
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.src = url
  })
}

function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    createImage(imageSrc)
      .then((image) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('No 2d context'))
          return
        }

        const maxSize = Math.max(image.width, image.height)
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

        canvas.width = safeArea
        canvas.height = safeArea

        ctx.translate(safeArea / 2, safeArea / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-safeArea / 2, -safeArea / 2)

        ctx.drawImage(
          image,
          safeArea / 2 - image.width * 0.5,
          safeArea / 2 - image.height * 0.5
        )

        const data = ctx.getImageData(0, 0, safeArea, safeArea)

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.putImageData(
          data,
          Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
          Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        )

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          const reader = new FileReader()
          reader.addEventListener('load', () =>
            resolve(reader.result as string)
          )
          reader.addEventListener('error', reject)
          reader.readAsDataURL(blob)
        }, 'image/jpeg')
      })
      .catch(reject)
  })
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  type,
  currentImageUrl,
  onSave,
  onRemove,
  title,
  description
}: ImageUploadDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const aspectRatio = type === 'profile' ? 1 : 4

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file')
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Image size must be less than 10MB')
          return
        }
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          setImageSrc(reader.result as string)
        })
        reader.readAsDataURL(file)
      }
    },
    []
  )

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixelsParam: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsParam)
    },
    []
  )

  const handleClose = useCallback(() => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    onOpenChange(false)
  }, [onOpenChange])

  const handleSave = useCallback(async () => {
    if (!(imageSrc && croppedAreaPixels)) {
      toast.error('Please select and crop an image')
      return
    }

    try {
      setIsSaving(true)
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0)
      await onSave(croppedImage)
      handleClose()
    } catch (_error) {
      toast.error('Failed to process image')
    } finally {
      setIsSaving(false)
    }
  }, [imageSrc, croppedAreaPixels, onSave, handleClose])

  const handleRemove = async () => {
    if (!onRemove) return
    try {
      setIsSaving(true)
      await onRemove()
      handleClose()
    } catch (_error) {
      toast.error('Failed to remove image')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {title ||
              (type === 'profile' ? 'Update Profile Picture' : 'Update Banner')}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (type === 'profile'
                ? 'Upload and crop your profile picture (square)'
                : 'Upload and position your banner image (4:1 ratio)')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {imageSrc ? (
            <div className="space-y-4">
              <div className="relative h-64 w-full overflow-hidden rounded-lg border bg-black sm:h-80">
                <Cropper
                  aspect={aspectRatio}
                  crop={crop}
                  cropShape={type === 'profile' ? 'round' : 'rect'}
                  image={imageSrc}
                  onCropChange={setCrop}
                  onCropComplete={handleCropComplete}
                  onZoomChange={setZoom}
                  zoom={zoom}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-muted-foreground text-sm"
                  htmlFor="zoom-slider"
                >
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <Slider
                  id="zoom-slider"
                  max={3}
                  min={1}
                  onValueChange={(value) => setZoom(value[0] ?? 1)}
                  step={0.1}
                  value={[zoom]}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setImageSrc(null)
                    setCrop({ x: 0, y: 0 })
                    setZoom(1)
                    setCroppedAreaPixels(null)
                  }}
                  type="button"
                  variant="outline"
                >
                  <X className="mr-2 h-4 w-4" />
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentImageUrl && (
                <div className="relative overflow-hidden rounded-lg border">
                  <img
                    alt={
                      type === 'profile' ? 'Current profile' : 'Current banner'
                    }
                    className="h-auto w-full object-cover"
                    src={currentImageUrl}
                  />
                </div>
              )}
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-border border-dashed p-12 transition-colors hover:border-primary/50">
                <label className="flex cursor-pointer flex-col items-center gap-4">
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    type="file"
                  />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">Click to upload image</p>
                    <p className="text-muted-foreground text-xs">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            {currentImageUrl && onRemove && (
              <Button
                disabled={isSaving}
                onClick={handleRemove}
                type="button"
                variant="destructive"
              >
                Remove
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                disabled={isSaving}
                onClick={handleClose}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={!(imageSrc && croppedAreaPixels) || isSaving}
                onClick={handleSave}
                type="button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
