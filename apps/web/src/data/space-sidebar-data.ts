import * as lr from 'lucide-react'

export interface ISpaces {
  name: string
  logo: lr.LucideIcon
  plan: 'Free' | 'Startup' | 'Enterprise'
  url: string
  isActive: boolean
}

export interface INavMain {
  title: string
  url: string
  icon: lr.LucideIcon
  isActive?: boolean
  items?: Array<{
    title: string
    url: string
  }>
}

export interface IProjects {
  name: string
  url: string
  icon: lr.LucideIcon
}

export const spaces: ISpaces[] = [
  {
    name: 'Dashboard',
    logo: lr.GalleryVerticalEnd,
    plan: 'Enterprise',
    url: '/spaces',
    isActive: true
  },
  {
    name: 'Academics',
    logo: lr.GraduationCap,
    plan: 'Startup',
    url: '/spaces/academics',
    isActive: true
  },
  {
    name: 'Social',
    logo: lr.AudioWaveform,
    plan: 'Free',
    url: '/spaces/social',
    isActive: false
  },
  {
    name: 'Personal',
    logo: lr.UserRound,
    plan: 'Free',
    url: '/spaces/personal',
    isActive: false
  },
  {
    name: 'Career',
    logo: lr.BriefcaseBusiness,
    plan: 'Free',
    url: '/spaces/career',
    isActive: false
  }
]

export const navMain: INavMain[] = [
  {
    title: 'Playground',
    url: '#',
    icon: lr.SquareTerminal,
    isActive: true,
    items: [
      { title: 'History', url: '#' },
      { title: 'Starred', url: '#' },
      { title: 'Settings', url: '#' }
    ]
  },
  {
    title: 'Models',
    url: '#',
    icon: lr.Bot,
    items: [
      { title: 'Genesis', url: '#' },
      { title: 'Explorer', url: '#' },
      { title: 'Quantum', url: '#' }
    ]
  },
  {
    title: 'Documentation',
    url: '#',
    icon: lr.BookOpen,
    items: [
      { title: 'Introduction', url: '#' },
      { title: 'Get Started', url: '#' },
      { title: 'Tutorials', url: '#' },
      { title: 'Changelog', url: '#' }
    ]
  },
  {
    title: 'Settings',
    url: '#',
    icon: lr.Settings2,
    items: [
      { title: 'General', url: '#' },
      { title: 'Team', url: '#' },
      { title: 'Billing', url: '#' },
      { title: 'Limits', url: '#' }
    ]
  }
]

export const projects: IProjects[] = [
  {
    name: 'Design Engineering',
    url: '#',
    icon: lr.Frame
  },
  {
    name: 'Sales & Marketing',
    url: '#',
    icon: lr.PieChart
  },
  {
    name: 'Travel',
    url: '#',
    icon: lr.MapIcon
  }
]
