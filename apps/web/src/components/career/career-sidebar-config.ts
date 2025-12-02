import { Briefcase, FileText, Network, Search } from 'lucide-react'
import type { SidebarNode } from '@/components/layout/use-space-sidebar-items'

/**
 * Career Space Sidebar Configuration
 * Defines the navigation items for the Career Space
 */
export const careerSidebarNodes: SidebarNode[] = [
  {
    id: 'resume-builder',
    title: 'Resume Builder',
    type: 'item',
    url: '/spaces/career/resume-builder',
    icon: FileText,
    isActive: false
  },
  {
    id: 'my-applications',
    title: 'My Applications',
    type: 'item',
    url: '/spaces/career/applications',
    icon: Briefcase,
    isActive: false
  },
  {
    id: 'find-jobs',
    title: 'Find Jobs',
    type: 'item',
    url: '/spaces/career/find-jobs',
    icon: Search,
    isActive: false
  },
  {
    id: 'network',
    title: 'Network',
    type: 'item',
    url: '/spaces/career/network',
    icon: Network,
    isActive: false
  }
]
