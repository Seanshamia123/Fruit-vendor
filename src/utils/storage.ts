import type { OnboardingState } from '../state/onboardingContext'

const KEY = 'fruitVendor:onboarding'

export type OnboardingPersisted = OnboardingState & {
  status: 'completed' | 'skipped' | 'deferred'
  updatedAt: string
}

export const saveOnboarding = (data: OnboardingPersisted) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (err) {
    // Best-effort; ignore quota/security errors for now
    console.warn('LocalStorage save failed', err)
  }
}

export const loadOnboarding = (): OnboardingPersisted | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as OnboardingPersisted
  } catch (err) {
    console.warn('LocalStorage read failed', err)
    return null
  }
}

export const clearOnboarding = () => {
  try {
    localStorage.removeItem(KEY)
  } catch (err) {
    console.warn('LocalStorage clear failed', err)
  }
}
