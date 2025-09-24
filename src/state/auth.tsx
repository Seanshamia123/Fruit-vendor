import { useMemo, useState, useEffect, type ReactNode, useCallback } from 'react'
import { AuthContext, type OnboardingStatus } from './authContext'
import { loadOnboarding, clearOnboarding } from '../utils/storage'

type AuthProviderProps = {
  children: ReactNode
}

type AuthStorage = {
  isAuthenticated: boolean
}

const AUTH_KEY = 'fruitVendor:auth'

const readAuthFromStorage = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Partial<AuthStorage>
    return Boolean(parsed.isAuthenticated)
  } catch (err) {
    console.warn('Failed to read auth state', err)
    return false
  }
}

const persistAuthToStorage = (isAuthenticated: boolean) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated }))
  } catch (err) {
    console.warn('Failed to persist auth state', err)
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => readAuthFromStorage())
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>(() => {
    const persisted = loadOnboarding()
    return persisted?.status ?? 'pending'
  })

  useEffect(() => {
    persistAuthToStorage(isAuthenticated)
  }, [isAuthenticated])

  const signIn = useCallback((): OnboardingStatus => {
    setIsAuthenticated(true)
    const persisted = loadOnboarding()
    const status = persisted?.status ?? 'pending'
    setOnboardingStatus(status)
    return status
  }, [])

  const signUp = useCallback((): OnboardingStatus => {
    clearOnboarding()
    setIsAuthenticated(true)
    setOnboardingStatus('pending')
    return 'pending'
  }, [])

  const signOut = useCallback(() => {
    setIsAuthenticated(false)
  }, [])

  const markOnboardingStatus = useCallback((status: OnboardingStatus) => {
    setOnboardingStatus(status)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, onboardingStatus, signIn, signUp, signOut, markOnboardingStatus }),
    [isAuthenticated, onboardingStatus, signIn, signUp, signOut, markOnboardingStatus]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
