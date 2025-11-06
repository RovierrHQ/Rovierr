'use client'

import { Button } from '@rov/ui/components/button'
import { motion } from 'framer-motion'
import { MapIcon } from 'lucide-react'
import Link from 'next/link'

const RoadmapNavigator = () => {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link aria-label="Open Roadmap" href="/roadmap">
        <Button className="rounded-full p-3 shadow-2xl" variant="default">
          <span className="sr-only">Roadmap</span>
          <MapIcon className="h-5 w-5" />
        </Button>
      </Link>
    </motion.div>
  )
}

export default RoadmapNavigator
