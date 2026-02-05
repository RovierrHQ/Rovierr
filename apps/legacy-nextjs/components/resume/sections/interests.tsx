'use client'

import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { useAtom } from 'jotai'
import { X } from 'lucide-react'
import { useState } from 'react'
import { interestsAtom } from '../lib/atoms'

export function InterestsSection() {
  const [interests, setInterests] = useAtom(interestsAtom)
  const [input, setInput] = useState('')

  const addInterest = () => {
    if (input.trim()) {
      setInterests([...interests, input.trim()])
      setInput('')
    }
  }

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="font-bold text-2xl">Interests</h2>
        <p className="text-muted-foreground text-sm">
          Add your interests and hobbies
        </p>
      </div>

      <div>
        <Label>Add Interest</Label>
        <div className="mt-2 flex gap-2">
          <Input
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addInterest()
              }
            }}
            placeholder="e.g., Photography, Hiking, Reading..."
            value={input}
          />
          <Button onClick={addInterest}>Add</Button>
        </div>
      </div>

      {interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, idx) => (
            <span
              className="flex items-center gap-2 rounded bg-primary/10 px-3 py-2 text-primary"
              key={interest}
            >
              {interest}
              <button onClick={() => removeInterest(idx)} type="button">
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {interests.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p>No interests added yet.</p>
        </div>
      )}
    </div>
  )
}
