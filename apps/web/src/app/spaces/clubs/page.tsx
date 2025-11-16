'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ClubsPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/spaces/clubs/campus-feed')
  }, [router])

  return null
}

export default ClubsPage
