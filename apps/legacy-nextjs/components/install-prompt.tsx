import { useEffect, useState } from 'react'

const REGEX = /iPad|iPhone|iPod/

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(
      // biome-ignore lint/suspicious/noExplicitAny: MSStream is not typed
      REGEX.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  return (
    <div>
      <h3>Install App</h3>
      <button type="button">Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span aria-label="share icon" role="img">
            {' '}
            ⎋{' '}
          </span>
          and then "Add to Home Screen"
          <span aria-label="plus icon" role="img">
            {' '}
            ➕{' '}
          </span>
          .
        </p>
      )}
    </div>
  )
}
