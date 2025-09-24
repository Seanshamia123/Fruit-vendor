import { createContext, useContext } from 'react'

export type OnboardingStatus = 'pending' | 'completed' | 'skipped' | 'deferred'

export type AuthContextValue = {
  isAuthenticated: boolean
  onboardingStatus: OnboardingStatus
  signIn: () => OnboardingStatus
  signUp: () => OnboardingStatus
  signOut: () => void
  markOnboardingStatus: (status: OnboardingStatus) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
