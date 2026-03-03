'use client'

import { Button } from '@rov/ui/components/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardTitle
// } from '@rov/ui/components/card'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function QueraPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-3xl">Quera</h1>
          <p className="text-muted-foreground">
            Live quizzes, polls, and forms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/apps/quera/build">
            <Button>
              <Plus className="mr-2 size-4" /> New Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* <Card className="border-white/10">
        <CardContent className="space-y-3 p-6">
          <CardTitle className="text-xl">
            {quiz.title || 'Untitled Quiz'}
          </CardTitle>
          <CardDescription>
            {quiz.questions.length} question
            {quiz.questions.length === 1 ? '' : 's'} · navigation:{' '}
            {quiz.settings.navigationMode}
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/apps/quera/build">
              <Button variant="secondary">Edit</Button>
            </Link>
            <Link href={`/apps/quera/play/${quiz.id}`}>
              <Button variant="outline">Preview</Button>
            </Link>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}

export default QueraPage
