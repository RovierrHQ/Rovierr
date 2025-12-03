'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { use, useEffect } from 'react'
import {
  activeSectionAtom,
  basicInfoAtom,
  certificationsAtom,
  educationAtom,
  experienceAtom,
  interestsAtom,
  languagesAtom,
  projectsAtom,
  volunteerAtom
} from '@/components/resume/lib/atoms'
import ResumePreview from '@/components/resume/renderer'
import { BasicInfoSection } from '@/components/resume/sections/basic-info'
import { CertificationsSection } from '@/components/resume/sections/certifications'
import { EducationSection } from '@/components/resume/sections/education'
import { ExperienceSection } from '@/components/resume/sections/experience'
import { InterestsSection } from '@/components/resume/sections/interests'
import { LanguagesSection } from '@/components/resume/sections/languages'
import { ProjectsSection } from '@/components/resume/sections/projects'
import { VolunteerSection } from '@/components/resume/sections/volunteer'
import { LeftSidebar } from '@/components/resume/side-nav'
import { orpc } from '@/utils/orpc'

function ResumeEditorPage({
  params
}: {
  params: Promise<{
    resumeid: string
  }>
}) {
  const { resumeid } = use(params)

  // Fetch resume data (only once on mount)
  const {
    data: resume,
    isLoading,
    error
  } = useQuery(orpc.resume.get.queryOptions({ input: { id: resumeid } }))

  // Atom setters
  const setBasicInfo = useSetAtom(basicInfoAtom)
  const setEducation = useSetAtom(educationAtom)
  const setExperience = useSetAtom(experienceAtom)
  const setProjects = useSetAtom(projectsAtom)
  const setCertifications = useSetAtom(certificationsAtom)
  const setLanguages = useSetAtom(languagesAtom)
  const setInterests = useSetAtom(interestsAtom)
  const setVolunteer = useSetAtom(volunteerAtom)
  // const [isDirty, setIsDirty] = useAtom(isDirtyAtom)

  // Get resume data from atoms for preview
  // const resumeData = useAtomValue(resumeDataAtom)

  // Initialize atoms when data loads
  useEffect(() => {
    if (isLoading) return
    if (resume?.data) {
      setBasicInfo(resume.data.basicInfo)
      setEducation(resume.data.education || [])
      setExperience(resume.data.experience || [])
      setProjects(resume.data.projects || [])
      setCertifications(resume.data.certifications || [])
      setLanguages(resume.data.languages || [])
      setInterests(resume.data.interests || [])
      setVolunteer(resume.data.volunteer || [])
      // setIsDirty(false)
    }
  }, [
    resume?.data,
    setBasicInfo,
    setCertifications,
    setEducation,
    setExperience,
    setInterests,
    isLoading,
    setLanguages,
    setProjects,
    setVolunteer
  ])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading resume...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-destructive">Failed to load resume</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Resume not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <LeftSidebar hasResume={!!resume} />

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <RenderSection />
      </div>

      {/* Preview */}
      <div className="flex w-1/2 flex-col border-l">
        <div className="flex-1">
          <ResumePreview
            resumeId={resumeid}
            resumeTitle={resume?.title || 'Resume'}
          />
        </div>
      </div>
    </div>
  )
}

const RenderSection = () => {
  const activeSection = useAtomValue(activeSectionAtom)

  switch (activeSection) {
    case 'basicInfo':
      return <BasicInfoSection />
    case 'education':
      return <EducationSection />
    case 'experience':
      return <ExperienceSection />
    case 'projects':
      return <ProjectsSection />
    case 'certifications':
      return <CertificationsSection />
    case 'languages':
      return <LanguagesSection />
    case 'interests':
      return <InterestsSection />
    case 'volunteer':
      return <VolunteerSection />
    default:
      return null
  }
}

export default ResumeEditorPage
