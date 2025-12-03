'use client'

import { Button } from '@rov/ui/components/button'
import { cn } from '@rov/ui/lib/utils'
import { useAtom } from 'jotai'
import {
  Award,
  Briefcase,
  FolderGit2,
  GraduationCap,
  HandHeart,
  Heart,
  Languages,
  User
} from 'lucide-react'
import { activeSectionAtom } from './lib/atoms'

interface LeftSidebarProps {
  hasResume: boolean
}

const sections = [
  { id: 'basicInfo' as const, label: 'Basic Info', icon: User },
  { id: 'education' as const, label: 'Education', icon: GraduationCap },
  { id: 'experience' as const, label: 'Experience', icon: Briefcase },
  { id: 'projects' as const, label: 'Projects', icon: FolderGit2 },
  { id: 'certifications' as const, label: 'Certifications', icon: Award },
  { id: 'languages' as const, label: 'Languages', icon: Languages },
  { id: 'interests' as const, label: 'Interests', icon: Heart },
  { id: 'volunteer' as const, label: 'Volunteer', icon: HandHeart }
]

export function LeftSidebar({ hasResume }: LeftSidebarProps) {
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom)

  return (
    <div className="w-64 border-r bg-muted/10 p-4">
      <div className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Button
              className={cn(
                'w-full justify-start',
                activeSection === section.id && 'bg-secondary'
              )}
              disabled={!hasResume}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              variant={activeSection === section.id ? 'secondary' : 'ghost'}
            >
              <Icon className="mr-2 h-4 w-4" />
              {section.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
