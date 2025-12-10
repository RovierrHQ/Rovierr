import type * as lr from 'lucide-react'

export const SpacesNames = {
  SPACES: 'Spaces',
  CLUBS: 'Societies',
  ACADEMICS: 'Academics',
  SOCIAL: 'Social',
  PERSONAL: 'Personal',
  CAREER: 'Career'
} as const

export type SpacesNames = (typeof SpacesNames)[keyof typeof SpacesNames]

export type ISpacesChildrenItems = {
  title: string
  url: string
  icon: lr.LucideIcon
  isActive?: boolean
  items?: Array<{
    title: string
    url: string
  }>
}

export type ISpaces = {
  name: SpacesNames
  logo: lr.LucideIcon
  plan: 'Free' | 'Startup' | 'Enterprise'
  url: string
  isActive: boolean
  childrenItems?: ISpacesChildrenItems[]
}

export type IProjects = {
  name: string
  url: string
  icon: lr.LucideIcon
}
