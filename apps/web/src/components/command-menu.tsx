'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@rov/ui/components/command'
import {
  BookOpen,
  Briefcase,
  Calendar,
  ClipboardCheck,
  DollarSign,
  FileText,
  GraduationCap,
  Heart,
  Home,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  Network,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  keywords?: string[]
}

const commandItems: MenuItem[] = [
  {
    id: 'focus',
    label: 'Focus Mode',
    icon: Zap,
    href: '/focus',
    keywords: ['focus', 'pomodoro', 'productivity']
  },
  // Main Pages
  {
    id: 'summary',
    label: 'Summary Dashboard',
    icon: LayoutDashboard,
    href: '/'
  },
  {
    id: 'education',
    label: 'Education & Academics',
    icon: GraduationCap,
    href: '/education'
  },
  { id: 'social', label: 'Social', icon: Users, href: '/social' },
  { id: 'career', label: 'Career', icon: Briefcase, href: '/career' },
  { id: 'personal', label: 'Personal', icon: Wallet, href: '/personal' },

  // Education Sections
  {
    id: 'courses',
    label: 'My Courses',
    icon: BookOpen,
    href: '/education/courses',
    keywords: ['education', 'class']
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: ClipboardCheck,
    href: '/education/assignments',
    keywords: ['education', 'homework', 'tasks']
  },
  {
    id: 'schedule',
    label: 'Study Schedule',
    icon: Calendar,
    href: '/education/schedule',
    keywords: ['education', 'calendar', 'timetable']
  },
  {
    id: 'resources',
    label: 'Study Resources',
    icon: FileText,
    href: '/education/resources',
    keywords: ['education', 'notes', 'materials']
  },

  // Social Sections
  {
    id: 'groups',
    label: 'My Groups',
    icon: Users,
    href: '/social/groups',
    keywords: ['social', 'teams', 'clubs']
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: Megaphone,
    href: '/social/announcements',
    keywords: ['social', 'news', 'updates']
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    href: '/social/events',
    keywords: ['social', 'activities', 'calendar']
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: UserPlus,
    href: '/social/contacts',
    keywords: ['social', 'friends', 'people']
  },

  // Career Sections
  {
    id: 'applications',
    label: 'Job Applications',
    icon: Briefcase,
    href: '/career/applications',
    keywords: ['career', 'jobs', 'applications']
  },
  {
    id: 'skills',
    label: 'Skills Development',
    icon: Lightbulb,
    href: '/career/skills',
    keywords: ['career', 'learning', 'growth']
  },
  {
    id: 'goals',
    label: 'Career Goals',
    icon: Target,
    href: '/career/goals',
    keywords: ['career', 'objectives']
  },
  {
    id: 'networking',
    label: 'Networking',
    icon: Network,
    href: '/career/networking',
    keywords: ['career', 'connections', 'contacts']
  },

  // Personal Sections
  {
    id: 'finance',
    label: 'Finance Management',
    icon: DollarSign,
    href: '/personal/finance',
    keywords: ['personal', 'money', 'budget']
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    icon: Heart,
    href: '/personal/health',
    keywords: ['personal', 'fitness', 'wellbeing']
  },
  {
    id: 'habits',
    label: 'Daily Habits',
    icon: TrendingUp,
    href: '/personal/habits',
    keywords: ['personal', 'routine', 'tracking']
  },
  {
    id: 'living',
    label: 'Living Essentials',
    icon: Home,
    href: '/personal/living',
    keywords: ['personal', 'home', 'utilities']
  }
]

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput placeholder="Search for pages and sections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {commandItems.slice(0, 1).map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Spaces">
          {commandItems.slice(1, 6).map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Education & Academics">
          {commandItems.slice(6, 10).map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Social">
          {commandItems.slice(10, 14).map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Career">
          {commandItems.slice(14, 18).map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Personal">
          {commandItems.slice(18).map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
