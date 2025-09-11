export interface PlatformInfo {
  name: string
  downloadUrl: string
  fileExtension: string
  icon: string
}

// Pre-define regex at module level for performance
const APPLE_SILICON_REGEX = /macintosh.*apple.*webkit/i

export function detectPlatform(): PlatformInfo {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      name: 'Universal',
      downloadUrl: '/downloads/rovierr-universal.tar.gz',
      fileExtension: '.tar.gz',
      icon: '📦'
    }
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform.toLowerCase()

  // macOS detection
  if (platform.includes('mac') || userAgent.includes('mac')) {
    // Detect Apple Silicon vs Intel
    const isAppleSilicon =
      userAgent.includes('mac') &&
      (userAgent.includes('arm') ||
        platform.includes('arm') ||
        // Additional check for Apple Silicon
        APPLE_SILICON_REGEX.test(userAgent))

    return {
      name: isAppleSilicon ? 'macOS (Apple Silicon)' : 'macOS (Intel)',
      downloadUrl: isAppleSilicon
        ? '/api/downloads/rovierr_aarch64.dmg'
        : '/api/downloads/rovierr_x64.dmg',
      fileExtension: '.dmg',
      icon: '🍎'
    }
  }

  // Windows detection
  if (platform.includes('win') || userAgent.includes('windows')) {
    // Detect architecture
    const is64bit =
      userAgent.includes('wow64') ||
      userAgent.includes('win64') ||
      userAgent.includes('x64')

    return {
      name: is64bit ? 'Windows (64-bit)' : 'Windows (32-bit)',
      downloadUrl: is64bit
        ? '/api/downloads/rovierr_x64_en-US.msi'
        : '/api/downloads/rovierr_x86_en-US.msi',
      fileExtension: '.msi',
      icon: '🪟'
    }
  }

  // Linux detection
  if (platform.includes('linux') || userAgent.includes('linux')) {
    // Detect architecture
    const isArm = platform.includes('arm') || userAgent.includes('arm')
    const is64bit =
      platform.includes('x86_64') ||
      platform.includes('amd64') ||
      userAgent.includes('x86_64')

    if (isArm) {
      return {
        name: 'Linux (ARM64)',
        downloadUrl: '/api/downloads/rovierr_aarch64.AppImage',
        fileExtension: '.AppImage',
        icon: '🐧'
      }
    }

    return {
      name: is64bit ? 'Linux (x64)' : 'Linux (x86)',
      downloadUrl: is64bit
        ? '/api/downloads/rovierr_amd64.AppImage'
        : '/api/downloads/rovierr_i386.AppImage',
      fileExtension: '.AppImage',
      icon: '🐧'
    }
  }

  // Fallback for other platforms
  return {
    name: 'Universal',
    downloadUrl: '/api/downloads/rovierr-universal.tar.gz',
    fileExtension: '.tar.gz',
    icon: '📦'
  }
}

export function getAllPlatforms(): PlatformInfo[] {
  return [
    {
      name: 'macOS (Apple Silicon)',
      downloadUrl: '/api/downloads/rovierr_aarch64.dmg',
      fileExtension: '.dmg',
      icon: '🍎'
    },
    {
      name: 'macOS (Intel)',
      downloadUrl: '/api/downloads/rovierr_x64.dmg',
      fileExtension: '.dmg',
      icon: '🍎'
    },
    {
      name: 'Windows (64-bit)',
      downloadUrl: '/api/downloads/rovierr_x64_en-US.msi',
      fileExtension: '.msi',
      icon: '🪟'
    },
    {
      name: 'Windows (32-bit)',
      downloadUrl: '/api/downloads/rovierr_x86_en-US.msi',
      fileExtension: '.msi',
      icon: '🪟'
    },
    {
      name: 'Linux (x64)',
      downloadUrl: '/api/downloads/rovierr_amd64.AppImage',
      fileExtension: '.AppImage',
      icon: '🐧'
    },
    {
      name: 'Linux (ARM64)',
      downloadUrl: '/api/downloads/rovierr_aarch64.AppImage',
      fileExtension: '.AppImage',
      icon: '🐧'
    }
  ]
}
