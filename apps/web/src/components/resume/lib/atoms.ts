import type {
  BasicInfo,
  Certification,
  Education,
  Experience,
  Language,
  Project,
  Volunteer
} from '@rov/orpc-contracts'
import { atom } from 'jotai'
import type { SectionId } from './types'

// Atoms for each resume section
export const basicInfoAtom = atom<BasicInfo | undefined>(undefined)
export const educationAtom = atom<Education[]>([])
export const experienceAtom = atom<Experience[]>([])
export const projectsAtom = atom<Project[]>([])
export const certificationsAtom = atom<Certification[]>([])
export const languagesAtom = atom<Language[]>([])
export const interestsAtom = atom<string[]>([])
export const volunteerAtom = atom<Volunteer[]>([])

// Derived atom that combines all sections for preview
export const resumeDataAtom = atom((get) => ({
  basicInfo: get(basicInfoAtom),
  education: get(educationAtom),
  experience: get(experienceAtom),
  projects: get(projectsAtom),
  certifications: get(certificationsAtom),
  languages: get(languagesAtom),
  interests: get(interestsAtom),
  volunteer: get(volunteerAtom)
}))

// Atom to track if data has been modified (for save on exit)
export const isDirtyAtom = atom(false)
export const activeSectionAtom = atom<SectionId>('basicInfo')
