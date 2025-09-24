import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SuccessMetrics from './pages/onboarding/SuccessMetrics'
import Preferences from './pages/onboarding/Preferences'
import StockTurnover from './pages/stockTurnover/StockTurnover'
import DailySales from './pages/dailySales/DailySales'
import SalesSummary from './pages/salesSummary/SalesSummary'
import InventoryAlert from './pages/inventoryAlert/InventoryAlert'
import SpoilageCheck from './pages/spoilageCheck/SpoilageCheck'
import LandingPage from './pages/landing/LandingPage'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Settings from './pages/Settings'
import { OnboardingProvider } from './state/onboarding'
import { AuthProvider } from './state/auth'
import { useAuth } from './state/authContext'
import type { ReactElement, ReactNode } from 'react'

type GuardProps = {
  children: ReactElement
}

const RequireAuth = ({ children }: GuardProps) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  return children
}

const RequireOnboardingComplete = ({ children }: GuardProps) => {
  const { onboardingStatus } = useAuth()

  if (onboardingStatus === 'pending') {
    return <Navigate to="/onboarding/metrics" replace />
  }

  return children
}

const RouteShell = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <OnboardingProvider>{children}</OnboardingProvider>
  </AuthProvider>
)

const App = () => {
  return (
    <RouteShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        <Route
          path="/onboarding/metrics"
          element={
            <RequireAuth>
              <SuccessMetrics />
            </RequireAuth>
          }
        />
        <Route
          path="/onboarding/preferences"
          element={
            <RequireAuth>
              <Preferences />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <Dashboard />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/stock-turnover"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <StockTurnover />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/daily-sales"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <DailySales />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/sales-summary"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <SalesSummary />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/inventory-alert"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <InventoryAlert />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/spoilage-check"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <SpoilageCheck />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <RequireOnboardingComplete>
                <Settings />
              </RequireOnboardingComplete>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteShell>
  )
}

export default App
