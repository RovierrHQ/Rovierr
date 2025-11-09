import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { orpc } from '@/utils/orpc'

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Feature Request', value: 'feature-request' },
  { label: 'Bug Report', value: 'bug-report' },
  { label: 'Improvement', value: 'improvement' }
]

const RoadmapFeed = () => {
  const [category, setCategory] = useState<string>(categories[0].value)
  const [page, setPage] = useState<number>(1)

  const normalizedCategory =
    category !== 'all'
      ? (category as 'feature-request' | 'bug-report' | 'improvement')
      : undefined

  const { data, isLoading, isError, error } = useQuery(
    orpc.roadmap.list.queryOptions({
      input: {
        query: {
          page,
          limit: 10,
          category: normalizedCategory
        }
      }
    })
  )

  const meta = data?.meta
  const list = data?.data ?? []

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  const handleNext = () => {
    if (meta && page < meta.totalPage) setPage((p) => p + 1)
  }

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1)
  }

  return (
    <section className="space-y-6 py-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="font-semibold text-xl">Roadmap Feed</h2>

        <Select onValueChange={handleCategoryChange} value={category}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {meta && (
        <div className="text-muted-foreground text-sm">
          Page {meta.page} of {meta.totalPage} ({meta.total} total)
        </div>
      )}

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground text-sm">
            Loading roadmaps...
          </span>
        </div>
      )}

      {isError && (
        <div className="p-4 text-center text-red-500">
          Failed to load roadmaps. {error instanceof Error ? error.message : ''}
        </div>
      )}

      {!(isLoading || isError) && list.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No roadmap items found for <strong>{category}</strong>.
        </div>
      )}

      {!(isLoading || isError) && list.length > 0 && (
        <div className="grid gap-4">
          {list.map((item) => (
            <Card className="transition hover:shadow-md" key={item.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <CardTitle className="font-medium text-lg">
                  {item.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className="capitalize" variant="outline">
                    {item.category.replace('-', ' ')}
                  </Badge>
                  <Badge
                    className="capitalize"
                    variant={
                      item.status === 'publish' ? 'default' : 'secondary'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
                <div className="mt-3 text-muted-foreground text-xs">
                  Created:{' '}
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta && meta.totalPage > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            disabled={page <= 1}
            onClick={handlePrev}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {meta.totalPage}
          </span>
          <Button
            disabled={page >= meta.totalPage}
            onClick={handleNext}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}

export default RoadmapFeed
