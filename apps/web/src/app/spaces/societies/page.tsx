'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const SocietiesPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/spaces/societies/campus-feed')
  }, [router])

  return null
}

export default SocietiesPage
