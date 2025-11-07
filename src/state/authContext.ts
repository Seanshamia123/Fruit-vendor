import { createContext, useContext } from 'react'
import type { VendorOut, LoginCredentials, VendorCreate } from '../services/types'

export type OnboardingStatus = 'pending' | 'completed' | 'skipped' | 'deferred'

export type AuthContextValue = {
  isAuthenticated: boolean
  onboardingStatus: OnboardingStatus
  vendor: VendorOut | null
  signIn: (credentials: LoginCredentials) => Promise<OnboardingStatus>
  signUp: (data: VendorCreate) => Promise<OnboardingStatus>
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
