import { createContext, useContext } from 'react'

export type KpiKey = string

export type PreferencesState = {
  timeframe: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
  displayType: 'Chart' | 'Table' | 'Cards'
  notifications: 'Never' | 'Daily' | 'Weekly' | 'Monthly'
  granularity: 'Daily' | 'Weekly' | 'Monthly'
}

export type OnboardingState = {
  selectedKpis: KpiKey[]
  preferences: PreferencesState
}

export type OnboardingCtx = OnboardingState & {
  toggleKpi: (kpi: KpiKey) => void
  setPreference: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => void
  reset: () => void
}

export const OnboardingContext = createContext<OnboardingCtx | null>(null)

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}

export const KPI_OPTIONS: KpiKey[] = [
  'Sales',
  'Revenue',
  'Profit',
  'Orders',
  'Average Order Value',
  'Customer Retention',
  'New Customers',
  'Refund Rate',
  'Inventory Turnover',
  'Conversion Rate',
  'Website Visits',
  'Basket Size',
]

