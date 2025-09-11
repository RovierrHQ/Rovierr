'use client'

import { Button } from '@rov/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { cn } from '@rov/ui/lib/utils'
import { ChevronDownIcon, DownloadIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  detectPlatform,
  getAllPlatforms,
  type PlatformInfo
} from '@/lib/platform-detector'

interface DownloadButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showDropdown?: boolean
}

export default function DownloadButton({
  variant = 'default',
  size = 'default',
  className,
  showDropdown = true
}: DownloadButtonProps) {
  const [platform, setPlatform] = useState<PlatformInfo | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setPlatform(detectPlatform())
  }, [])

  const handleDownload = (platformInfo: PlatformInfo) => {
    // In a real app, this would trigger the actual download
    // For now, we'll create a temporary link to simulate download
    const link = document.createElement('a')
    link.href = platformInfo.downloadUrl
    link.download = `rovierr${platformInfo.fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const allPlatforms = getAllPlatforms()

  const shouldShowLoading = !isClient || platform === null
  if (shouldShowLoading) {
    return (
      <Button
        className={cn('gap-2', className)}
        disabled
        size={size}
        variant={variant}
      >
        <DownloadIcon className="h-4 w-4" />
        Download Desktop App
      </Button>
    )
  }

  if (!showDropdown) {
    return (
      <Button
        className={cn('gap-2', className)}
        onClick={() => handleDownload(platform)}
        size={size}
        variant={variant}
      >
        <DownloadIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Download for</span>
        <span className="flex items-center gap-1">
          <span>{platform.icon}</span>
          <span className="hidden md:inline">{platform.name}</span>
          <span className="md:hidden">{platform.name.split(' ')[0]}</span>
        </span>
      </Button>
    )
  }

  return (
    <div className="flex">
      <Button
        className={cn('gap-2 rounded-r-none', className)}
        onClick={() => handleDownload(platform)}
        size={size}
        variant={variant}
      >
        <DownloadIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Download for</span>
        <span className="flex items-center gap-1">
          <span>{platform.icon}</span>
          <span className="hidden md:inline">{platform.name}</span>
          <span className="md:hidden">{platform.name.split(' ')[0]}</span>
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn('rounded-l-none border-l-0 px-2', className)}
            size={size}
            variant={variant}
          >
            <ChevronDownIcon className="h-4 w-4" />
            <span className="sr-only">Download options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => handleDownload(platform)}
          >
            <span>{platform.icon}</span>
            <div className="flex flex-col">
              <span className="font-medium">{platform.name}</span>
              <span className="text-muted-foreground text-xs">
                Recommended for your device
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {allPlatforms
            .filter((p) => p.name !== platform.name)
            .map((platformInfo) => (
              <DropdownMenuItem
                className="flex items-center gap-2"
                key={platformInfo.name}
                onClick={() => handleDownload(platformInfo)}
              >
                <span>{platformInfo.icon}</span>
                <span>{platformInfo.name}</span>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
