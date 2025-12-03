'use client'

import type { ResumeData } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { useMutation } from '@tanstack/react-query'
import { useMeasure } from '@uidotdev/usehooks'
import { useAtomValue } from 'jotai'
import { Download } from 'lucide-react'
import { useRef } from 'react'
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from 'react-zoom-pan-pinch'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import { resumeDataAtom } from '../lib/atoms'
import SelectedTemplate from '../templates'
import useDownloadResume from './download-resume'

interface ResumePreviewProps {
  resumeTitle: string
  resumeId: string
}

const ResumePreview = ({ resumeTitle, resumeId }: ResumePreviewProps) => {
  const resumeData = useAtomValue(resumeDataAtom)
  const { handleDownload, isDownloading } = useDownloadResume({
    resumeData,
    resumeTitle: resumeTitle || 'resume'
  })
  return (
    <div className="flex h-full shrink-0 grow-0 flex-col overflow-hidden rounded-md bg-white shadow">
      <div className="flex items-center justify-between border-b p-3">
        <p className="font-semibold text-lg text-slate-900">Preview</p>
        <div className="flex items-center gap-2">
          <SaveResume resumeid={resumeId} />
          <Button
            className="text-primary"
            disabled={isDownloading}
            onClick={handleDownload}
            size="icon"
            variant="outline"
          >
            <Download className={isDownloading ? 'animate-pulse' : ''} />
          </Button>
        </div>
      </div>

      <ResumePDFViewer resumeData={resumeData} />
    </div>
  )
}

export const SaveResume = ({ resumeid }: { resumeid: string }) => {
  const resumeData = useAtomValue(resumeDataAtom)
  const saveMutation = useMutation(
    orpc.resume.updateData.mutationOptions({
      onSuccess: () => {
        toast.success('Resume saved successfully')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to save resume')
      }
    })
  )

  return (
    <Button
      disabled={saveMutation.isPending}
      onClick={() =>
        saveMutation.mutate({
          resumeId: resumeid,
          data: resumeData
        })
      }
      type="button"
      variant="secondary"
    >
      {saveMutation.isPending ? 'Saving...' : 'Save Now'}
    </Button>
  )
}

export const ResumePDFViewer = ({
  resumeData,
  zoom = 100,
  constraint = 'width',
  disableZoom
}: {
  resumeData: ResumeData
  zoom?: number
  constraint?: 'width' | 'height'
  disableZoom?: boolean
}) => {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const [ref, { width = 0, height = 0 }] = useMeasure()

  return (
    <div className="h-full max-h-full overflow-auto bg-gray-100" ref={ref}>
      <TransformWrapper
        disabled={disableZoom}
        initialPositionX={0}
        initialPositionY={0}
        initialScale={zoom / 100}
        ref={transformComponentRef}
      >
        {() => (
          <TransformComponent>
            <SelectedTemplate
              constraint={constraint}
              containerDimension={{
                width: width || 0,
                height: height || 0
              }}
              resumeData={resumeData}
              zoom={zoom}
            />
          </TransformComponent>
        )}
      </TransformWrapper>
    </div>
  )
}

export default ResumePreview
