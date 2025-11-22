'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'

// Helper function to get icon from tags or default
const getIconFromTags = (tags: string[] | null | undefined): string => {
  if (!tags || tags.length === 0) return '🏛️'
  const firstTag = tags[0]?.toLowerCase() ?? ''
  if (firstTag.includes('tech') || firstTag.includes('technology')) return '💻'
  if (firstTag.includes('art') || firstTag.includes('arts')) return '📸'
  if (firstTag.includes('sport')) return '⚽'
  if (firstTag.includes('academic')) return '🎓'
  if (firstTag.includes('business')) return '💼'
  return '🏛️'
}

// Helper function to get category from tags or default
const getCategoryFromTags = (tags: string[] | null | undefined): string => {
  if (!tags || tags.length === 0) return 'General'
  return tags[0] ?? 'General'
}

const BrowseClubs = () => {
  const { data, isLoading, isError } = useQuery(
    orpc.studentOrganizations.listAllOrganizations.queryOptions({
      input: {
        query: {
          page: 1,
          limit: 50
        }
      }
    })
  )

  const organizations = data?.data ?? []

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <Input className="flex-1" placeholder="Search clubs..." />
            <Button asChild>
              <Link href="/spaces/societies/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Club
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge className="cursor-pointer" variant="default">
              All
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Technology
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Arts
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Sports
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Academic
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card className="p-6" key={index.toString()}>
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="mb-3 h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Failed to load clubs. Please try again later.
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <Input className="flex-1" placeholder="Search clubs..." />
            <Button asChild>
              <Link href="/spaces/societies/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Club
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge className="cursor-pointer" variant="default">
              All
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Technology
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Arts
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Sports
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Academic
            </Badge>
          </div>
        </div>
        <div className="py-8 text-center text-muted-foreground">
          No clubs found. Be the first to create one!
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-4">
          <Input className="flex-1" placeholder="Search clubs..." />
          <Button asChild>
            <Link href="/spaces/clubs/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Club
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge className="cursor-pointer" variant="default">
            All
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Technology
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Arts
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Sports
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Academic
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {organizations.map((club) => (
          <Card className="p-6" key={club.id}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{getIconFromTags(club.tags)}</div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold">{club.name}</h3>
                <div className="mb-3 text-muted-foreground text-sm">
                  {club.memberCount} members • {getCategoryFromTags(club.tags)}
                </div>
                <Button className="w-full" size="sm">
                  Join Club
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default BrowseClubs
