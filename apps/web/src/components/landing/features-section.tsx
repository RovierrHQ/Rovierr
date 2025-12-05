'use client'

import { Briefcase, GraduationCap, Mail, Users } from 'lucide-react'
import FeatureCard from './feature-card'

interface FeaturesSectionProps {
  className?: string
}

const features = [
  {
    id: 'society-management',
    title: 'Society Management',
    description:
      'Manage your student clubs like a pro. From debate clubs to international associations—coordinate teams, send campaign emails to hundreds of members, assign tasks to executives, track expenses, and post announcements. All in one place.',
    icon: Users
  },
  {
    id: 'campus-community',
    title: 'Campus Community Feed',
    description:
      'Connect with verified university students across your campus and beyond. Share experiences, discover what other universities are doing, and collaborate across campuses. Your university life, amplified.',
    icon: Mail
  },
  {
    id: 'academic-spaces',
    title: 'Academic & Career Spaces',
    description:
      'Access dedicated spaces for academics, societies, and career development. Build your resume, collaborate on projects, and prepare for your future—all within your student ecosystem.',
    icon: GraduationCap
  },
  {
    id: 'realtime-collaboration',
    title: 'Real-time Collaboration',
    description:
      'Work together seamlessly with live updates, interactive quizzes, and instant communication. Perfect for group projects, study sessions, and team coordination.',
    icon: Briefcase
  }
]

export default function FeaturesSection({
  className = ''
}: FeaturesSectionProps) {
  return (
    <section className={`px-4 py-20 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        {/* Section Heading */}
        <div className="mb-16 text-center">
          <h2 className="font-bold text-3xl text-neutral-900 md:text-4xl dark:text-neutral-100">
            Why Choose Rovierr
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 md:text-lg dark:text-neutral-400">
            Everything you need to succeed as a student, all in one place
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-16 md:space-y-24">
          {features.map((feature, index) => (
            <FeatureCard
              description={feature.description}
              icon={feature.icon}
              index={index}
              isReversed={index % 2 !== 0}
              key={feature.id}
              title={feature.title}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
