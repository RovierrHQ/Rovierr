import type * as lr from 'lucide-react'

export const SpacesNames = {
  SPACES: 'Spaces',
  CLUBS: 'Clubs',
  ACADEMICS: 'Academics',
  SOCIAL: 'Social',
  PERSONAL: 'Personal',
  CAREER: 'Career'
} as const

export type SpacesNames = (typeof SpacesNames)[keyof typeof SpacesNames]

export interface ISpacesChildrenItems {
  title: string
  url: string
  icon: lr.LucideIcon
  isActive?: boolean
  items?: Array<{
    title: string
    url: string
  }>
}

export interface ISpaces {
  name: SpacesNames
  logo: lr.LucideIcon
  plan: 'Free' | 'Startup' | 'Enterprise'
  url: string
  isActive: boolean
  childrenItems?: ISpacesChildrenItems[]
}

export interface IProjects {
  name: string
  url: string
  icon: lr.LucideIcon
}
