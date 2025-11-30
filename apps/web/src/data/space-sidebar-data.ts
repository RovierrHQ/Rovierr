import {
  AudioWaveform,
  BriefcaseBusiness,
  Compass,
  Frame,
  GraduationCap,
  MapIcon,
  PieChart,
  UserRound,
  Users
} from 'lucide-react'
import {
  type IProjects,
  type ISpaces,
  SpacesNames
} from '@/types/types-space-sidebar-data'

export const spaces: ISpaces[] = [
  {
    name: SpacesNames.PERSONAL,
    logo: UserRound,
    plan: 'Free',
    url: '/spaces/personal',
    isActive: false
  },
  {
    name: SpacesNames.ACADEMICS,
    logo: GraduationCap,
    plan: 'Startup',
    url: '/spaces/academics',
    isActive: true
  },

  {
    name: SpacesNames.CLUBS,
    logo: Users,
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
  },
  {
    name: SpacesNames.CAREER,
    logo: BriefcaseBusiness,
    plan: 'Free',
    url: '/spaces/career',
    isActive: false
  },
  {
    name: SpacesNames.SOCIAL,
    logo: AudioWaveform,
    plan: 'Free',
    url: '/spaces/social',
    isActive: false
  }
]

export const projects: IProjects[] = [
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
