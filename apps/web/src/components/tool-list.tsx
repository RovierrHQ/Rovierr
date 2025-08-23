'use client'

import { Badge } from '@rov/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '@rov/ui/components/card'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

const featuredColors: Record<string, string> = {
  new: 'bg-gradient-to-r from-pink-100 via-red-200 to-orange-200 text-black shadow-md',
  'coming soon':
    'bg-gradient-to-r from-indigo-100 via-blue-200 to-cyan-200 text-black shadow-md'
}

function ToolList() {
  return (
    <motion.div
      className="relative mt-32 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial={{ opacity: 0.0, y: 40 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: 'easeInOut'
      }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {[
        {
          name: 'Quera',
          tagline: 'Interaction, Simplified.',
          description:
            'Quera is a dynamic interaction platform for live quizzes, polls, forms, and voting—whether real-time or self-paced.',
          link: '/apps/kahoot',
          featured: 'new',
          tags: ['quiz', 'realtime', 'classroom', 'polls', 'forms', 'voting']
        },
        {
          name: 'smart class',
          tagline: 'Interactive Learning, Anywhere.',
          description:
            'Transform your classroom into an interactive digital learning environment with virtual whiteboards and collaboration tools. Enable students to participate remotely or in-person with seamless content sharing. Track attendance, participation, and learning progress in one unified platform.',
          link: '/apps/smartclass',
          featured: 'coming soon',
          tags: ['whiteboard', 'attendance']
        },
        {
          name: 'spin',
          tagline: 'Random, Made Simple.',
          description:
            'Create customizable spin-the-wheel games for random selection, prize giveaways, or decision making activities. Add your own options, colors, and winning probabilities to match your specific needs. Perfect for classroom activities, team meetings, or promotional events.',
          link: '/apps/spin',
          featured: 'coming soon',
          tags: ['games', 'randomizer']
        },
        {
          name: 'team builder',
          tagline: 'Teams, Balanced.',
          description:
            'Automatically create balanced teams based on skills, preferences, or random assignment for group projects and activities. Intelligent algorithms ensure fair distribution while considering member preferences and constraints. Export team assignments and track project progress across groups.',
          link: '/apps/teambuilder',
          featured: 'coming soon',
          tags: ['teams', 'balance']
        }
      ].map((item) => (
        <Link
          className="group block focus:outline-none"
          href={item.link}
          key={item.name}
        >
          <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-background/60 via-background/40 to-background/20 shadow-xl backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 hover:shadow-2xl">
            {/* Animated Gradient Glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-fuchsia-200/10 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
            />

            {/* Top border shimmer */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <CardContent className="relative space-y-4 p-6">
              {item.featured ? (
                <Badge
                  className={`-top-4 absolute right-4 rounded-full px-3 py-1 font-medium text-xs ${featuredColors[item.featured.toLowerCase()] || 'bg-gray-700 text-white'}`}
                >
                  {item.featured}
                </Badge>
              ) : null}

              {/* Title + Arrow */}
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="line-clamp-1 font-semibold text-foreground text-lg tracking-tight transition-colors duration-300 group-hover:text-primary">
                  {item.name}
                </CardTitle>
                <ArrowUpRight className="group-hover:-translate-y-1 size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              {/* Tagline if exists */}
              {item.tagline ? (
                <p className="text-muted-foreground/80 text-sm italic">
                  {item.tagline}
                </p>
              ) : null}

              {/* Description */}
              <CardDescription className="line-clamp-3 text-muted-foreground/90 text-sm leading-relaxed">
                {item.description}
              </CardDescription>

              {/* Tags */}
              {item.tags && item.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      className="rounded-full bg-white/5 px-3 py-1 font-medium text-muted-foreground text-xs ring-1 ring-white/10 backdrop-blur-sm group-hover:ring-primary/20"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
                      +{item.tags.length - 3}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Link>
      ))}
    </motion.div>
  )
}

export default ToolList
