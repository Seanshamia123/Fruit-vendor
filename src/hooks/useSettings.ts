import { useState, useEffect, useCallback } from 'react'
import { vendorApi, preferenceApi } from '../services/api'
import type { VendorOut, VendorPreference, VendorPreferenceUpdate } from '../services/types'

export type SettingsData = {
  vendor: VendorOut | null
  preferences: VendorPreference | null
  isLoading: boolean
  error: string | null
}

export type SettingsActions = {
  updateVendor: (data: { name?: string; contact?: string; location?: string }) => Promise<void>
  updatePreferences: (data: VendorPreferenceUpdate) => Promise<void>
  refetch: () => Promise<void>
}

export const useSettings = (): SettingsData & SettingsActions => {
  const [vendor, setVendor] = useState<VendorOut | null>(null)
  const [preferences, setPreferences] = useState<VendorPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [vendorData, preferencesData] = await Promise.all([
        vendorApi.getCurrent(),
        preferenceApi.get(),
      ])

      setVendor(vendorData)
      setPreferences(preferencesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      console.error('Error loading settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateVendor = useCallback(
    async (data: { name?: string; contact?: string; location?: string }) => {
      if (!vendor) return

      try {
        setError(null)
        const updated = await vendorApi.update(vendor.id, data)
        setVendor(updated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update vendor')
        throw err
      }
    },
    [vendor]
  )

  const updatePreferences = useCallback(async (data: VendorPreferenceUpdate) => {
    try {
      setError(null)
      const updated = await preferenceApi.update(data)
      setPreferences(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      throw err
    }
  }, [])

  return {
    vendor,
    preferences,
    isLoading,
    error,
    updateVendor,
    updatePreferences,
    refetch: fetchData,
  }
}
