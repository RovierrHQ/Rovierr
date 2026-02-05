import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/spaces/career/resume-builder/$resumeid')(
  {
    component: () => null
  }
)
