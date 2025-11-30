import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { Pin, Search } from 'lucide-react'

interface DiscussionFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedFilter: 'all' | 'pinned' | 'resolved' | 'unresolved'
  onFilterChange: (filter: 'all' | 'pinned' | 'resolved' | 'unresolved') => void
}

export function DiscussionFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange
}: DiscussionFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search discussions..."
          value={searchQuery}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onFilterChange('all')}
          size="sm"
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
        >
          All
        </Button>
        <Button
          onClick={() => onFilterChange('pinned')}
          size="sm"
          variant={selectedFilter === 'pinned' ? 'default' : 'outline'}
        >
          <Pin className="mr-1 h-3 w-3" />
          Pinned
        </Button>
        <Button
          onClick={() => onFilterChange('resolved')}
          size="sm"
          variant={selectedFilter === 'resolved' ? 'default' : 'outline'}
        >
          Resolved
        </Button>
        <Button
          onClick={() => onFilterChange('unresolved')}
          size="sm"
          variant={selectedFilter === 'unresolved' ? 'default' : 'outline'}
        >
          Unresolved
        </Button>
      </div>
    </div>
  )
}
