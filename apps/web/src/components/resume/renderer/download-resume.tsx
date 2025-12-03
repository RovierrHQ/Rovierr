import { pdf } from '@react-pdf/renderer'
import type { ResumeData } from '@rov/orpc-contracts'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import AzurillTemplate from '../templates/azurill'

interface UseDownloadResumeProps {
  resumeData: ResumeData
  resumeTitle: string
}

const useDownloadResume = ({
  resumeData,
  resumeTitle
}: UseDownloadResumeProps) => {
  const [isClient, setIsClient] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDownload = useCallback(async () => {
    if (!isClient) return

    setIsDownloading(true)
    try {
      const mypdf = pdf()
      mypdf.updateContainer(<AzurillTemplate resumeData={resumeData} />)
      const blob = await mypdf.toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resumeTitle || 'resume'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Resume downloaded successfully')
    } catch (_error) {
      toast.error('Failed to download resume')
    } finally {
      setIsDownloading(false)
    }
  }, [isClient, resumeData, resumeTitle])

  return { handleDownload, isDownloading }
}

export default useDownloadResume
