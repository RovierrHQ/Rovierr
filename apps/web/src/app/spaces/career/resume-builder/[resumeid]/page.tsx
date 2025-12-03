'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const _queryClient = useQueryClient()

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
    // setIsDirty,
    setLanguages,
    setProjects,
    setVolunteer
  ])

  // Save mutation
  // const saveMutation = useMutation(
  //   orpc.resume.updateSection.mutationOptions({
  //     onSuccess: () => {
  //       setIsDirty(false)
  //       queryClient.invalidateQueries({ queryKey: ['resume', 'get', resumeid] })
  //       toast.success('Resume saved')
  //     },
  //     onError: (error) => {
  //       toast.error(error.message || 'Failed to save resume')
  //     }
  //   })
  // )

  // Save all sections to backend
  // const saveAllSections = useCallback(async () => {
  //   if (!isDirty) return

  //   // Save all sections in sequence
  //   const sections = [
  //     { section: 'basicInfo', data: resumeData.basicInfo },
  //     { section: 'education', data: resumeData.education },
  //     { section: 'experience', data: resumeData.experience },
  //     { section: 'projects', data: resumeData.projects },
  //     { section: 'certifications', data: resumeData.certifications },
  //     { section: 'languages', data: resumeData.languages },
  //     { section: 'interests', data: resumeData.interests },
  //     { section: 'volunteer', data: resumeData.volunteer }
  //   ]

  //   for (const { section, data } of sections) {
  //     await saveMutation.mutateAsync({
  //       resumeId: resumeid,
  //       section: section as any,
  //       data
  //     })
  //   }
  // }, [isDirty, resumeData, resumeid, saveMutation])

  // // Save on page unload
  // useEffect(() => {
  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     if (isDirty) {
  //       e.preventDefault()
  //       e.returnValue = ''
  //     }
  //   }

  //   window.addEventListener('beforeunload', handleBeforeUnload)
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  // }, [isDirty])

  // // Save when leaving the page
  // useEffect(() => {
  //   return () => {
  //     if (isDirty) {
  //       saveAllSections()
  //     }
  //   }
  // }, [isDirty, saveAllSections])

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
        {/* {isDirty && (
          <div className="flex items-center justify-between border-b bg-yellow-50 p-3">
            <span className="text-sm text-yellow-800">Unsaved changes</span>
            <button
              className="rounded bg-primary px-3 py-1 text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
              disabled={saveMutation.isPending}
              onClick={saveAllSections}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        )} */}
        <div className="flex-1">
          <ResumePreview resumeTitle={resume?.title || 'Resume'} />
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
