'use client'

import dynamic from 'next/dynamic'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const PdfRenderer = ({
  containerDimension,
  pdfBlob,
  constraint = 'width'
}: {
  pdfBlob: Blob
  containerDimension: {
    width: number
    height: number
  }
  constraint?: 'width' | 'height'
}) => {
  return (
    <Document file={pdfBlob} rotate={0}>
      <Page
        className=""
        height={constraint === 'height' ? containerDimension.height : undefined}
        pageNumber={1}
        scale={1}
        width={constraint === 'width' ? containerDimension.width : undefined}
      />
    </Document>
  )
}

export default dynamic(() => Promise.resolve(PdfRenderer), {
  ssr: false
})
