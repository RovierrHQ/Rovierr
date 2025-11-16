'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { Textarea } from '@rov/ui/components/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CreateClubPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call to create club
    console.log('Creating club:', formData)
    // After successful creation, redirect to the new club page
    // router.push(`/spaces/clubs/joined/${clubId}`)
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button asChild size="sm" variant="ghost">
          <Link href="/spaces/clubs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clubs
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="mb-6 font-semibold text-2xl sm:text-3xl">
          Create a New Club
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Club Name</Label>
            <Input
              id="name"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter club name"
              required
              value={formData.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what your club is about"
              required
              rows={4}
              value={formData.description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="e.g., Technology, Arts, Sports"
              required
              value={formData.category}
            />
          </div>

          <div className="flex gap-4">
            <Button className="flex-1" type="submit">
              Create Club
            </Button>
            <Button
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateClubPage
