import { pdf } from '@react-pdf/renderer'
import type { ResumeData } from '@rov/orpc-contracts'
import AzurillTemplate from './azurill'

interface SelectedTemplateProps {
  resumeData: ResumeData
  zoom?: number
  containerDimension?: {
    width: number
    height: number
  }
  constraint?: 'width' | 'height'
}

export function SelectedTemplate({ resumeData }: SelectedTemplateProps) {
  // For now, we only have the Azurill template
  // In the future, you can add template selection logic here
  return <AzurillTemplate resumeData={resumeData} />
}

export const reactpdfToText = (resumeData: ResumeData) => {
  const mypdf = pdf()
  mypdf.updateContainer(<AzurillTemplate resumeData={resumeData} />)
  const stringValue = mypdf.toBlob()
  return stringValue
}
