import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

const getType = (w: number): DeviceType => {
  if (w < 640) return 'mobile' // < sm
  if (w < 1024) return 'tablet' // < lg
  return 'desktop'
}

export const useDevice = () => {
  const [device, setDevice] = useState<DeviceType>(() => getType(typeof window !== 'undefined' ? window.innerWidth : 1024))

  useEffect(() => {
    const onResize = () => setDevice(getType(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return device
}

