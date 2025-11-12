import * as lr from 'lucide-react'
import * as types from '@/types/types-space-sidebar-data'

export const spaces: types.ISpaces[] = [
  {
    name: types.SpacesNames.SPACES,
    logo: lr.GalleryVerticalEnd,
    plan: 'Enterprise',
    url: '/spaces',
    isActive: false,
    childrenItems: [
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
  },
  {
    name: types.SpacesNames.ACADEMICS,
    logo: lr.GraduationCap,
    plan: 'Startup',
    url: '/spaces/academics',
    isActive: false
  },
  {
    name: types.SpacesNames.SOCIAL,
    logo: lr.AudioWaveform,
    plan: 'Free',
    url: '/spaces/social',
    isActive: false
  },
  {
    name: types.SpacesNames.PERSONAL,
    logo: lr.UserRound,
    plan: 'Free',
    url: '/spaces/personal',
    isActive: false
  },
  {
    name: types.SpacesNames.CAREER,
    logo: lr.BriefcaseBusiness,
    plan: 'Free',
    url: '/spaces/career',
    isActive: false
  },
  {
    name: types.SpacesNames.CLUBS,
    logo: lr.Club,
    plan: 'Free',
    url: '/spaces/clubs',
    isActive: true,
    childrenItems: [
      {
        title: 'Clubs & Societies',
        url: '/spaces/clubs/societies',
        icon: lr.Users,
        isActive: true,
        items: [
          {
            title: 'Campus Feed',
            url: '/spaces/clubs/societies/campus-feed'
          },
          {
            title: 'My Clubs',
            url: '/spaces/clubs/societies/my-clubs'
          },
          {
            title: 'Events',
            url: '/spaces/clubs/societies/events'
          }
        ]
      },
      {
        title: 'Discover',
        url: '/spaces/clubs/discover',
        icon: lr.Compass,
        isActive: false,
        items: [
          {
            title: 'Browse Clubs',
            url: '/spaces/clubs/discover/browse-clubs'
          },
          {
            title: 'Network',
            url: '/spaces/clubs/discover/network'
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
