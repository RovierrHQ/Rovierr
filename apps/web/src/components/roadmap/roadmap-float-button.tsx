'use client'

import { Button } from '@rov/ui/components/button'
import { MapIcon } from 'lucide-react'
import AddRoadmap from './add-roadmap'

const RoadmapFloatButton = () => {
  return (
    <div className="fixed right-4 bottom-4 z-50 translate-y-4 scale-90 transition-transform duration-300 ease-out [animation:floatFadeIn_0.6s_ease-out_forwards] hover:scale-110 active:scale-95 md:right-6 md:bottom-6 ">
      <AddRoadmap>
        <Button
          className="size-[40px] rounded-full text-center leading-[40px] shadow-2xl"
          variant="default"
        >
          <span className="sr-only">Roadmap</span>
          <MapIcon className="h-5 w-5" />
        </Button>
      </AddRoadmap>
    </div>
  )
}

export default RoadmapFloatButton
