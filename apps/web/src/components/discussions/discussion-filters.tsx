import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { Search, TrendingUp } from 'lucide-react'

type DiscussionFiltersProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedFilter: 'all' | 'trending' | 'recent' | 'unanswered'
  onFilterChange: (filter: 'all' | 'trending' | 'recent' | 'unanswered') => void
}

export function DiscussionFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange
}: DiscussionFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search discussions..."
          value={searchQuery}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onFilterChange('all')}
          size="sm"
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
        >
          All Threads
        </Button>
        <Button
          onClick={() => onFilterChange('trending')}
          size="sm"
          variant={selectedFilter === 'trending' ? 'default' : 'outline'}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Trending
        </Button>
        <Button
          onClick={() => onFilterChange('recent')}
          size="sm"
          variant={selectedFilter === 'recent' ? 'default' : 'outline'}
        >
          Recent
        </Button>
        <Button
          onClick={() => onFilterChange('unanswered')}
          size="sm"
          variant={selectedFilter === 'unanswered' ? 'default' : 'outline'}
        >
          Unanswered
        </Button>
      </div>
    </div>
  )
}
