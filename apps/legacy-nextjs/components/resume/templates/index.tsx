'use client'

import { pdf } from '@react-pdf/renderer'
import type { ResumeData } from '@rov/orpc-contracts'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import PdfRenderer from '../renderer/pdf-renderer'
import { SelectedTemplate } from './utils'

const Preview = ({
  containerDimension,
  resumeData,
  constraint = 'width'
}: {
  containerDimension: {
    width: number
    height: number
  }
  resumeData: ResumeData
  zoom?: number
  constraint?: 'width' | 'height'
}) => {
  const [pdfblob, setPdfblob] = useState<Blob | null>(null)

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const mypdf = pdf()
      mypdf.updateContainer(<SelectedTemplate resumeData={resumeData} />)
      const blob = await mypdf.toBlob()

      setPdfblob(blob)
    }, 500)

    return () => clearTimeout(timeout)
  }, [resumeData])

  if (!pdfblob) return null

  return (
    <PdfRenderer
      constraint={constraint}
      containerDimension={containerDimension}
      pdfBlob={pdfblob}
    />
  )
}

export default dynamic(() => Promise.resolve(Preview), {
  ssr: false
})
