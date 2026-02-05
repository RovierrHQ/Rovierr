'use client'

import { Card } from '@rov/ui/components/card'
import {
  Building2,
  Calendar,
  ChevronRight,
  Github,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User
} from 'lucide-react'

export function PersonalInformation() {
  return (
    <Card className="space-y-6 border-border/50 bg-card/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Personal Information</h3>
        </div>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 font-medium text-primary text-sm">
          <GraduationCap className="h-4 w-4" />
          University Identity
        </h4>
        <div className="space-y-3">
          <div className="flex cursor-pointer items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 transition-colors hover:bg-primary/10">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-muted-foreground text-xs">University</p>
                <p className="font-medium text-sm">
                  Chinese University of Hong Kong
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex cursor-pointer items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 transition-colors hover:bg-primary/10">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <div>
                <p className="text-muted-foreground text-xs">Student ID</p>
                <p className="font-medium text-sm">1155123456</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex cursor-pointer items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 transition-colors hover:bg-primary/10">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-muted-foreground text-xs">
                  University Email
                </p>
                <p className="font-medium text-sm">
                  alex.wong@link.cuhk.edu.hk
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      {/* </CHANGE> */}

      <div className="border-border/30 border-t pt-4">
        <h4 className="mb-3 font-medium text-muted-foreground text-sm">
          Contact Information
        </h4>
        <div className="space-y-3">
          <div className="flex cursor-pointer items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Personal Email</p>
                <p className="font-medium text-sm">
                  alexwong.personal@gmail.com
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex cursor-pointer items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="font-medium text-sm">+852 9123 4567</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex cursor-pointer items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Location</p>
                <p className="font-medium text-sm">Hong Kong</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex cursor-pointer items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Member Since</p>
                <p className="font-medium text-sm">September 2023</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      {/* </CHANGE> */}

      <div className="border-border/30 border-t pt-4">
        <h4 className="mb-3 font-medium text-muted-foreground text-sm">
          Social Links
        </h4>
        <div className="space-y-2">
          <a
            className="group flex items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
            href="https://linkedin.com/in/alexwong"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex items-center gap-3">
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              <div>
                <p className="font-medium text-sm transition-colors group-hover:text-primary">
                  LinkedIn
                </p>
                <p className="text-muted-foreground text-xs">@alexwong</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>

          <a
            className="group flex items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
            href="https://github.com/alexwong"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex items-center gap-3">
              <Github className="h-4 w-4 text-foreground" />
              <div>
                <p className="font-medium text-sm transition-colors group-hover:text-primary">
                  GitHub
                </p>
                <p className="text-muted-foreground text-xs">@alexwong</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>

          <a
            className="group flex items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
            href="https://instagram.com/alexwong"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex items-center gap-3">
              <Instagram className="h-4 w-4 text-[#E4405F]" />
              <div>
                <p className="font-medium text-sm transition-colors group-hover:text-primary">
                  Instagram
                </p>
                <p className="text-muted-foreground text-xs">@alexwong</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>

          <a
            className="group flex items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
            href="https://wa.me/85291234567"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <div>
                <p className="font-medium text-sm transition-colors group-hover:text-primary">
                  WhatsApp
                </p>
                <p className="text-muted-foreground text-xs">+852 9123 4567</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </Card>
  )
}
