import {
  AudioWaveform,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Club,
  Compass,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  MapIcon,
  PieChart,
  Settings2,
  SquareTerminal,
  UserRound,
  Users
} from 'lucide-react'
import * as types from '@/types/types-space-sidebar-data'

export const spaces: types.ISpaces[] = [
  {
    name: types.SpacesNames.SPACES,
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
    url: '/spaces',
    isActive: false,
    childrenItems: [
      {
        title: 'Playground',
        url: '#',
        icon: SquareTerminal,
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
        icon: Bot,
        items: [
          { title: 'Genesis', url: '#' },
          { title: 'Explorer', url: '#' },
          { title: 'Quantum', url: '#' }
        ]
      },
      {
        title: 'Documentation',
        url: '#',
        icon: BookOpen,
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
        icon: Settings2,
        items: [
          { title: 'General', url: '#' },
          { title: 'Team', url: '#' },
          { title: 'Billing', url: '#' },
          { title: 'Limits', url: '#' }
        ]
      }
    ]
  },
  {
    name: types.SpacesNames.ACADEMICS,
    logo: GraduationCap,
    plan: 'Startup',
    url: '/spaces/academics',
    isActive: false
  },
  {
    name: types.SpacesNames.SOCIAL,
    logo: AudioWaveform,
    plan: 'Free',
    url: '/spaces/social',
    isActive: false
  },
  {
    name: types.SpacesNames.PERSONAL,
    logo: UserRound,
    plan: 'Free',
    url: '/spaces/personal',
    isActive: false
  },
  {
    name: types.SpacesNames.CAREER,
    logo: BriefcaseBusiness,
    plan: 'Free',
    url: '/spaces/career',
    isActive: false
  },
  {
    name: types.SpacesNames.CLUBS,
    logo: Club,
    plan: 'Free',
    url: '/spaces/societies',
    isActive: true,
    childrenItems: [
      {
        title: 'Societies',
        url: '/spaces/societies',
        icon: Users,
        isActive: true,
        items: [
          {
            title: 'Campus Feed',
            url: '/spaces/societies/campus-feed'
          },
          {
            title: 'Mine',
            url: '/spaces/societies/mine'
          },
          {
            title: 'Events',
            url: '/spaces/societies/discover/events'
          }
        ]
      },
      {
        title: 'Discover',
        url: '/spaces/societies/discover',
        icon: Compass,
        isActive: false,
        items: [
          {
            title: 'Browse Societies',
            url: '/spaces/societies/discover/browse-clubs'
          },
          {
            title: 'Network',
            url: '/spaces/societies/discover/network'
          }
        ]
      }
    ]
  }
]

export const projects: types.IProjects[] = [
  {
    name: 'Design Engineering',
    url: '#',
    icon: Frame
  },
  {
    name: 'Sales & Marketing',
    url: '#',
    icon: PieChart
  },
  {
    name: 'Travel',
    url: '#',
    icon: MapIcon
  }
]
