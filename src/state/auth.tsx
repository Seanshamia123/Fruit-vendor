import { useMemo, useState, useEffect, type ReactNode, useCallback } from 'react'
import { AuthContext, type OnboardingStatus } from './authContext'
import { loadOnboarding, clearOnboarding } from '../utils/storage'
import { authApi } from '../services/api'
import type { VendorOut, LoginCredentials, VendorCreate } from '../services/types'

type AuthProviderProps = {
  children: ReactNode
}

type AuthStorage = {
  isAuthenticated: boolean
  vendor?: VendorOut
}

const AUTH_KEY = 'fruitVendor:auth'
const TOKEN_KEY = 'fruitVendor:auth-token'

const readAuthFromStorage = (): { isAuthenticated: boolean; vendor: VendorOut | null } => {
  if (typeof window === 'undefined') return { isAuthenticated: false, vendor: null }
  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return { isAuthenticated: false, vendor: null }
    const parsed = JSON.parse(raw) as Partial<AuthStorage>
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      vendor: parsed.vendor ?? null,
    }
  } catch (err) {
    console.warn('Failed to read auth state', err)
    return { isAuthenticated: false, vendor: null }
  }
}

const persistAuthToStorage = (isAuthenticated: boolean, vendor: VendorOut | null) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated, vendor }))
  } catch (err) {
    console.warn('Failed to persist auth state', err)
  }
}

const persistToken = (token: string) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify({ token }))
  } catch (err) {
    console.warn('Failed to persist token', err)
  }
}

const clearToken = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    console.warn('Failed to clear token', err)
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const initialAuth = useMemo(() => readAuthFromStorage(), [])
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.isAuthenticated)
  const [vendor, setVendor] = useState<VendorOut | null>(initialAuth.vendor)
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>(() => {
    const persisted = loadOnboarding()
    return persisted?.status ?? 'pending'
  })

  useEffect(() => {
    persistAuthToStorage(isAuthenticated, vendor)
  }, [isAuthenticated, vendor])

  const signIn = useCallback(async (credentials: LoginCredentials): Promise<OnboardingStatus> => {
    try {
      const authResponse = await authApi.login(credentials)
      persistToken(authResponse.access_token)

      // Use the vendor object from the auth response
      setVendor(authResponse.vendor)
      setIsAuthenticated(true)

      // Check onboarding status from the backend
      const status: OnboardingStatus = authResponse.vendor.onboarding_completed ? 'completed' : 'pending'
      setOnboardingStatus(status)
      return status
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [])

  const signUp = useCallback(async (data: VendorCreate): Promise<OnboardingStatus> => {
    try {
      await authApi.register(data)

      // After registration, automatically log in
      const authResponse = await authApi.login({
        username: data.email,
        password: data.password,
      })

      persistToken(authResponse.access_token)
      setVendor(authResponse.vendor)
      setIsAuthenticated(true)

      clearOnboarding()
      // New users should always have onboarding_completed = false
      setOnboardingStatus('pending')
      return 'pending'
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }, [])

  const signOut = useCallback(() => {
    setIsAuthenticated(false)
    setVendor(null)
    clearToken()
    persistAuthToStorage(false, null)
  }, [])

  const markOnboardingStatus = useCallback((status: OnboardingStatus) => {
    setOnboardingStatus(status)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, vendor, onboardingStatus, signIn, signUp, signOut, markOnboardingStatus }),
    [isAuthenticated, vendor, onboardingStatus, signIn, signUp, signOut, markOnboardingStatus]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
