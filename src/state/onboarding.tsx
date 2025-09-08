import React, { useMemo, useState } from 'react'
import { OnboardingContext, type PreferencesState, type OnboardingCtx, type KpiKey } from './onboardingContext'

const defaultPreferences: PreferencesState = {
  timeframe: 'Daily',
  displayType: 'Chart',
  notifications: 'Never',
  granularity: 'Daily',
}

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedKpis, setSelectedKpis] = useState<KpiKey[]>([])
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences)

  const toggleKpi = (kpi: KpiKey) => {
    setSelectedKpis(prev => (prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]))
  }

  const setPreference: OnboardingCtx['setPreference'] = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const reset = () => {
    setSelectedKpis([])
    setPreferences(defaultPreferences)
  }

  const value = useMemo<OnboardingCtx>(() => ({ selectedKpis, preferences, toggleKpi, setPreference, reset }), [selectedKpis, preferences])

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}
